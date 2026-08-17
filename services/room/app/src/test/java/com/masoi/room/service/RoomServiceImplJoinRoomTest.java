package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.dto.response.JoinRoomResponse;
import com.masoi.room.exception.PlayerIdGenerationExhaustedException;
import com.masoi.room.exception.JoinRoomSerializationException;
import com.masoi.room.exception.JoinRoomNotFoundException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomPlayingException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.utils.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class RoomServiceImplJoinRoomTest {
    private final RoomRepository repository = mock(RoomRepository.class);
    private final RoomLock lock = mock(RoomLock.class);
    private final PlayerIdGenerator ids = mock(PlayerIdGenerator.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private RoomServiceImpl service;

    @BeforeEach
    void setUp() {
        when(lock.acquireOrThrow("A7K9Q2")).thenReturn("token");
        service = new RoomServiceImpl(mock(HostIdGenerator.class), mock(RoomCodeGenerator.class), repository,
                mock(QrUrlFactory.class), lock, mock(UpdateMaxPlayersRoomStore.class), ids, mock(PlayerAuthStore.class));
    }

    @Test
    void playingRoomRejectsJoinWithoutMutation() {
        ObjectNode root = room(6);
        root.put("lifecycle", "PLAYING");
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        assertThatThrownBy(() -> service.joinRoom("A7K9Q2", new JoinRoomRequest("Player"))).isInstanceOf(RoomPlayingException.class);
        verify(repository, never()).write(any(), any());
        verify(lock).release("A7K9Q2", "token");
    }

    @Test
    void trimsNameAppendsNullRoleAndReleasesLock() {
        ObjectNode root = room(6);
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        when(ids.generate()).thenReturn("uuid");
        assertThat(service.joinRoom("A7K9Q2", new JoinRoomRequest(" Alice  Smith "))).isEqualTo(new JoinRoomResponse("uuid", "Alice  Smith"));
        assertThat(root.path("players").get(0).path("roleId").isNull()).isTrue();
        verify(repository).write("A7K9Q2", root);
        verify(lock).release("A7K9Q2", "token");
    }

    @Test
    void allowsCaseInsensitiveDuplicateWithDistinctIdentity() {
        ObjectNode root = room(6);
        root.withArray("players").addObject().put("playerId", "one").put("playerName", "Alice").putNull("roleId");
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        when(ids.generate()).thenReturn("two");
        assertThat(service.joinRoom("A7K9Q2", new JoinRoomRequest(" alice ")).playerId()).isEqualTo("two");
        verify(repository).write("A7K9Q2", root);
        verify(lock).release("A7K9Q2", "token");
    }

    @Test
    void retriesCollidingIdsAndUsesTheFirstUniqueUuid() {
        ObjectNode root = room(6);
        root.withArray("players").addObject().put("playerId", "same").put("playerName", "Old").putNull("roleId");
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        when(ids.generate()).thenReturn("same", "uuid-2");
        assertThat(service.joinRoom("A7K9Q2", new JoinRoomRequest("Alice")).playerId()).isEqualTo("uuid-2");
        verify(ids, times(2)).generate();
        verify(repository).write("A7K9Q2", root);
    }

    @Test
    void exhaustsAfterFiveCollisionsWithoutWriteAndReleasesLock() {
        ObjectNode root = room(6);
        root.withArray("players").addObject().put("playerId", "same").put("playerName", "Old").putNull("roleId");
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        when(ids.generate()).thenReturn("same");
        assertThatThrownBy(() -> service.joinRoom("A7K9Q2", new JoinRoomRequest("Alice"))).isInstanceOf(PlayerIdGenerationExhaustedException.class);
        verify(ids, times(5)).generate();
        verify(repository, never()).write(any(), any());
        verify(lock).release("A7K9Q2", "token");
    }

    @Test
    void mapsReadAndWriteFailuresAndAlwaysReleasesLock() {
        when(repository.read("A7K9Q2")).thenThrow(new RoomStorageUnavailableException(new RuntimeException()));
        assertThatThrownBy(() -> service.joinRoom("A7K9Q2", new JoinRoomRequest("Alice"))).isInstanceOf(RoomStorageUnavailableException.class);
        verify(lock).release("A7K9Q2", "token");
        reset(repository, lock);
        when(lock.acquireOrThrow("A7K9Q2")).thenReturn("token");
        ObjectNode root = room(6);
        when(repository.read("A7K9Q2")).thenReturn(snapshot(root));
        when(ids.generate()).thenReturn("id");
        doThrow(new RoomStorageUnavailableException(new RuntimeException())).when(repository).write("A7K9Q2", root);
        assertThatThrownBy(() -> service.joinRoom("A7K9Q2", new JoinRoomRequest("Alice"))).isInstanceOf(RoomStorageUnavailableException.class);
        verify(lock).release("A7K9Q2", "token");
    }

    private ObjectNode room(int max) {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", "A7K9Q2");
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", max);
        root.putArray("players");
        return root;
    }

    private RoomSnapshot snapshot(ObjectNode root) {
        return new RoomSnapshot(root, root.path("hostId").asString(), root.path("maxPlayers").asInt(), root.withArray("players").size());
    }
}
