package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.exception.HostCredentialInvalidException;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.exception.MaxPlayersOutOfRangeException;
import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.exception.RoomPlayingException;
import com.masoi.room.exception.InvalidRoomCodeException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.utils.HostIdGenerator;
import com.masoi.room.utils.QrUrlFactory;
import com.masoi.room.utils.RedisRoomLock;
import com.masoi.room.utils.RoomCodeGenerator;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.PlayerIdGenerator;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class RoomServiceImplUpdateMaxPlayersTest {
    @Test
    void playingRoomRejectsMaxPlayersWithoutMutation() {
        RoomSnapshot playing = snapshot(HOST_ID, 6, 0);
        playing.root().put("lifecycle", "PLAYING");
        when(store.read(ROOM_CODE)).thenReturn(playing);
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomPlayingException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
        verify(lock).release(ROOM_CODE, "owner-token");
    }

    private static final String ROOM_CODE = "A7K9Q2";
    private static final String HOST_ID = "mP5cYgYNGxa2-WPNnTMR1Q";

    private final RoomLock lock = mock(RoomLock.class);
    private final UpdateMaxPlayersRoomStore store = mock(UpdateMaxPlayersRoomStore.class);
    private final HostIdGenerator hosts = mock(HostIdGenerator.class);
    private final RoomCodeGenerator codes = mock(RoomCodeGenerator.class);
    private final RoomRepository repository = mock(RoomRepository.class);
    private final QrUrlFactory qr = mock(QrUrlFactory.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private RoomServiceImpl service;

    @BeforeEach
    void setUp() {
        when(lock.acquireOrThrow(anyString())).thenReturn("owner-token");
        service = new RoomServiceImpl(hosts, codes, repository, qr, lock, store,
                mock(PlayerIdGenerator.class), mock(PlayerAuthStore.class));
    }

    private RoomSnapshot snapshot(String hostId, int maxPlayers, int playerCount) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("roomCode", ROOM_CODE);
        root.put("hostId", hostId);
        root.put("maxPlayers", maxPlayers);
        root.set("players", objectMapper.createArrayNode());
        return new RoomSnapshot(root, hostId, maxPlayers, playerCount);
    }

    @Test
    void rejectsOutOfRangeBeforeAcquiringLock() {
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 5))
                .isInstanceOf(MaxPlayersOutOfRangeException.class);
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 13))
                .isInstanceOf(MaxPlayersOutOfRangeException.class);
        verifyNoInteractions(store);
        verify(lock, never()).acquireOrThrow(anyString());
    }

    @Test
    void rejectsNonCanonicalRoomCodeBeforeAcquiringLock() {
        assertThatThrownBy(() -> service.updateMaxPlayers("a7k9q2", HOST_ID, 9))
                .isInstanceOf(InvalidRoomCodeException.class);
        verifyNoInteractions(store);
        verify(lock, never()).acquireOrThrow(anyString());
    }

    @Test
    void readsAuthorizesCountsThenWritesAndReleasesInExactOrder() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 0));
        UpdateMaxPlayersResponse result = service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9);
        assertThat(result).isEqualTo(new UpdateMaxPlayersResponse(9));
        InOrder inOrder = inOrder(lock, store);
        inOrder.verify(lock).acquireOrThrow(ROOM_CODE);
        inOrder.verify(store).read(ROOM_CODE);
        inOrder.verify(store).write(eq(ROOM_CODE), any(ObjectNode.class));
        inOrder.verify(lock).release(eq(ROOM_CODE), eq("owner-token"));
    }

    @Test
    void writtenRootReplacesOnlyMaxPlayers() {
        RoomSnapshot roomSnapshot = snapshot(HOST_ID, 6, 0);
        when(store.read(ROOM_CODE)).thenReturn(roomSnapshot);
        service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9);
        org.mockito.ArgumentCaptor<ObjectNode> captor = org.mockito.ArgumentCaptor.forClass(ObjectNode.class);
        verify(store).write(eq(ROOM_CODE), captor.capture());
        assertThat(captor.getValue().get("maxPlayers").asInt()).isEqualTo(9);
    }

    @Test
    void noWriteBeforeAuthorization() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 0));
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, "wrong-host", 9)).isInstanceOf(HostCredentialInvalidException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
    }

    @Test
    void noWriteAfterBelowPlayerCountFailure() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 12, 8));
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 7)).isInstanceOf(MaxPlayersBelowPlayerCountException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
    }

    @Test
    void noWriteWhenRoomNotFound() {
        when(store.read(ROOM_CODE)).thenReturn(null);
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomNotFoundException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
    }

    @Test
    void sameValueCanonicalizesMissingLifecycleUnderLock() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 0));
        assertThat(service.updateMaxPlayers(ROOM_CODE, HOST_ID, 6)).isEqualTo(new UpdateMaxPlayersResponse(6));
        verify(store).read(ROOM_CODE);
        verify(store).write(eq(ROOM_CODE), org.mockito.ArgumentMatchers.argThat(root -> "WAITING".equals(root.path("lifecycle").asText())));
        verify(lock).release(ROOM_CODE, "owner-token");
    }

    @Test
    void sameValueStillRejectsBelowPlayerCount() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 8));
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 6)).isInstanceOf(MaxPlayersBelowPlayerCountException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
    }

    @Test
    void storageFailureIsNotRetried() {
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 0));
        org.mockito.Mockito.doThrow(new RoomStorageUnavailableException(new RuntimeException("redis down")))
                .when(store).write(eq(ROOM_CODE), any(ObjectNode.class));
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomStorageUnavailableException.class);
        verify(store).write(eq(ROOM_CODE), any(ObjectNode.class));
        verify(lock).release(ROOM_CODE, "owner-token");
    }

    @Test
    void releaseAlwaysRunsInFinallyEvenWhenReadFails() {
        when(store.read(ROOM_CODE)).thenThrow(new RoomStorageUnavailableException(new RuntimeException("redis down")));
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomStorageUnavailableException.class);
        verify(lock).release(ROOM_CODE, "owner-token");
        verify(store, never()).write(anyString(), any(ObjectNode.class));
    }

    @Test
    void malformedStoredHostIdStopsBeforeAuthorizationOrWrite() {
        when(store.read(ROOM_CODE)).thenThrow(new RoomSerializationException(null));

        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9))
                .isInstanceOf(RoomSerializationException.class)
                .isNotInstanceOf(HostCredentialInvalidException.class);
        verify(store, never()).write(anyString(), any(ObjectNode.class));
        verify(lock).release(ROOM_CODE, "owner-token");
    }

    @Test
    void acquisitionFailureNeverReadsWritesOrReleases() {
        when(lock.acquireOrThrow(ROOM_CODE)).thenThrow(new RoomUpdateBusyException());
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomUpdateBusyException.class);
        verify(store, never()).read(anyString());
        verify(store, never()).write(anyString(), any(ObjectNode.class));
        verify(lock, never()).release(anyString(), anyString());
    }

    @Test
    void releaseFailureDoesNotMaskCommittedWrite() {
        org.springframework.data.redis.core.StringRedisTemplate redis = mock(org.springframework.data.redis.core.StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        org.springframework.data.redis.core.ValueOperations<String, String> values = mock(org.springframework.data.redis.core.ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        when(values.setIfAbsent(anyString(), anyString(), any(java.time.Duration.class))).thenReturn(true);
        when(redis.execute(any(org.springframework.data.redis.core.script.RedisScript.class), any(java.util.List.class), any()))
                .thenThrow(new IllegalStateException("release failed"));
        RedisRoomLock ownerSafeLock = new RedisRoomLock(redis, () -> "owner-token",
                new com.masoi.room.config.RoomLockProperties(java.time.Duration.ofMillis(10),
                        java.time.Duration.ofSeconds(10), java.time.Duration.ofMillis(1)));
        RoomServiceImpl localService = new RoomServiceImpl(hosts, codes, repository, qr, ownerSafeLock, store,
                mock(PlayerIdGenerator.class), mock(PlayerAuthStore.class));
        when(store.read(ROOM_CODE)).thenReturn(snapshot(HOST_ID, 6, 0));
        assertThat(localService.updateMaxPlayers(ROOM_CODE, HOST_ID, 9))
                .isEqualTo(new UpdateMaxPlayersResponse(9));
        verify(store).write(eq(ROOM_CODE), any(ObjectNode.class));
        verify(redis).execute(any(org.springframework.data.redis.core.script.RedisScript.class), any(java.util.List.class), eq("owner-token"));
        verify(redis, never()).delete(anyString());
        verify(store, never()).write(eq(ROOM_CODE), org.mockito.ArgumentMatchers.argThat(root -> root.get("maxPlayers").asInt() == 6));
    }
}
