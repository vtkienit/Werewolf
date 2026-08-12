package com.masoi.room.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.masoi.room.dto.request.EndGameRequest;
import com.masoi.room.dto.request.StartGameRequest;
import com.masoi.room.dto.response.EndGameEvent;
import com.masoi.room.dto.response.StartGameEvent;
import com.masoi.room.exception.*;
import com.masoi.room.model.RoleId;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.utils.RoomLock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class GameEventServiceTest {
    private final RoomRepository rooms = mock(RoomRepository.class);
    private final RoomLock lock = mock(RoomLock.class);
    private final SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
    private final GameEventLifecycleRegistry lifecycle = new GameEventLifecycleRegistry();
    private final GameEventService service = new GameEventService(rooms, lock, lifecycle, messaging);
    private ObjectNode roomRoot;

    @BeforeEach
    void room() {
        when(lock.acquireOrThrow("ABC234")).thenReturn("owner");
        roomRoot = new ObjectMapper().createObjectNode();
        roomRoot.putArray("players").addObject().put("playerId", "p1").put("playerName", "Kien");
        when(rooms.read("ABC234")).thenReturn(new RoomSnapshot(roomRoot, "host", 6, 1));
    }

    @Test
    void startValidatesMemberNamePublishesStoredNameAndReleasesLock() {
        service.start("ABC234", "p1", new StartGameRequest("game-001", "Kien", RoleId.WEREWOLF));
        ArgumentCaptor<Object> event = ArgumentCaptor.forClass(Object.class);
        verify(messaging).convertAndSend(eq("/broadcast/distribution/rooms/ABC234/start-game/p1"), event.capture());
        assertThat(event.getValue()).isInstanceOfSatisfying(StartGameEvent.class, value -> {
            assertThat(value.gameId()).isEqualTo("game-001");
            assertThat(value.playerName()).isEqualTo("Kien");
            assertThat(value.roleId()).isEqualTo(RoleId.WEREWOLF);
        });
        verify(lock).release("ABC234", "owner");
        assertThat(rooms.read("ABC234").root().toString()).doesNotContain("roleId", "werewolf");
    }

    @Test
    void startRejectsInvalidRoomMissingRoomPlayerAndMismatchedName() {
        assertThatThrownBy(() -> service.start("abc234", "p1", request())).isInstanceOf(InvalidRoomCodeException.class);
        when(rooms.read("ABC234")).thenReturn(null);
        assertThatThrownBy(() -> service.start("ABC234", "p1", request())).isInstanceOf(RoomNotFoundException.class);
        room();
        assertThatThrownBy(() -> service.start("ABC234", "missing", request())).isInstanceOf(PlayerNotFoundException.class).hasMessage("Player was not found");
        assertThatThrownBy(() -> service.start("ABC234", "p1", new StartGameRequest("game-001", "Other", RoleId.WEREWOLF)))
                .isInstanceOf(PlayerNameMismatchException.class).hasMessage("Player name does not match");
    }

    @Test
    void duplicateStartDoesNotRepublishAndConflictsStaySafe() {
        service.start("ABC234", "p1", request());
        service.start("ABC234", "p1", request());
        verify(messaging, times(1)).convertAndSend(anyString(), any(Object.class));
        assertThatThrownBy(() -> service.start("ABC234", "p1", new StartGameRequest("game-001", "Kien", RoleId.SEER)))
                .isInstanceOf(GameEventConflictException.class).hasMessageNotContaining("game-001").hasMessageNotContaining("Kien").hasMessageNotContaining("seer");
        assertThatThrownBy(() -> service.start("ABC234", "p1", new StartGameRequest("game-002", "Kien", RoleId.WEREWOLF)))
                .isInstanceOf(GameEventConflictException.class);
    }

    @Test
    void startPublicationFailureRollsBackAndReleasesLock() {
        doThrow(new IllegalStateException("broker")).doNothing().when(messaging).convertAndSend(anyString(), any(Object.class));
        assertThatThrownBy(() -> service.start("ABC234", "p1", request()))
                .isInstanceOf(RealtimePublicationException.class).hasMessage("Realtime event publication failed").hasMessageNotContaining("game-001").hasMessageNotContaining("Kien");
        service.start("ABC234", "p1", request());
        verify(lock, times(2)).release("ABC234", "owner");
    }

    @Test
    void lockAcquisitionFailureDoesNotRelease() {
        when(lock.acquireOrThrow("ABC234")).thenThrow(new RoomUpdateBusyException());
        assertThatThrownBy(() -> service.start("ABC234", "p1", request())).isInstanceOf(RoomUpdateBusyException.class);
        verify(lock, never()).release(anyString(), anyString());
    }

    @Test
    void endPublishesOnceRejectsStaleAndReleasesAfterFailure() {
        service.start("ABC234", "p1", request());
        roomRoot.putObject("lastCompletedGame").put("winningSide", "VILLAGE").putArray("roles").addObject().put("roleId", "seer").put("quantity", 1);
        service.end("ABC234", new EndGameRequest("game-001"));
        service.end("ABC234", new EndGameRequest("game-001"));
        verify(messaging, times(1)).convertAndSend(eq("/broadcast/rooms/ABC234/end-game"), any(Object.class));
        service.start("ABC234", "p1", new StartGameRequest("game-002", "Kien", RoleId.SEER));
        assertThatThrownBy(() -> service.end("ABC234", new EndGameRequest("game-001"))).isInstanceOf(GameEventConflictException.class);
    }

    @Test
    void endBeforeStartMissingRoomAndPublicationFailureAreSafe() {
        assertThatThrownBy(() -> service.end("ABC234", new EndGameRequest("game-001"))).isInstanceOf(GameEventConflictException.class);
        when(rooms.read("ABC234")).thenReturn(null);
        assertThatThrownBy(() -> service.end("ABC234", new EndGameRequest("game-001"))).isInstanceOf(RoomNotFoundException.class);
        room();
        service.start("ABC234", "p1", request());
        doThrow(new IllegalStateException("broker")).doNothing().when(messaging)
                .convertAndSend(eq("/broadcast/rooms/ABC234/end-game"), any(Object.class));
        assertThatThrownBy(() -> service.end("ABC234", new EndGameRequest("game-001"))).isInstanceOf(RealtimePublicationException.class);
        service.end("ABC234", new EndGameRequest("game-001"));
        verify(lock, atLeast(4)).release("ABC234", "owner");
    }

    @Test
    void replayPublishesAssignedAndLastEndButIgnoresUnassignedUnknownAndFailures() {
        service.start("ABC234", "p1", request());
        roomRoot.put("lifecycle", "PLAYING");
        ((ObjectNode) roomRoot.withArray("players").get(0)).put("roleId", "werewolf");
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p1");
        verify(messaging).convertAndSend(eq("/broadcast/distribution/rooms/ABC234/start-game/p1"), any(StartGameEvent.class));
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p2");
        verifyNoInteractions(messaging);
        service.end("ABC234", new EndGameRequest("game-001"));
        roomRoot.put("lifecycle", "WAITING");
        ((ObjectNode) roomRoot.withArray("players").get(0)).putNull("roleId");
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p2");
        verify(messaging).convertAndSend(eq("/broadcast/rooms/ABC234/end-game"), any(Object.class));
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("XYZ789", "p1");
        verifyNoInteractions(messaging);
        doThrow(new IllegalStateException("broker")).when(messaging).convertAndSend(anyString(), any(Object.class));
        assertThatCode(() -> service.replayAfterPlayerConnect("ABC234", "p1")).doesNotThrowAnyException();
    }

    @Test
    void failedEndCallbackPersistedWaitingAndInvalidPersistedRolesRejectStaleReplay() {
        service.start("ABC234", "p1", request());
        roomRoot.put("lifecycle", "WAITING");
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p1");
        verifyNoInteractions(messaging);

        lifecycle.invalidate("ABC234");
        service.start("ABC234", "p1", new StartGameRequest("game-002", "Kien", RoleId.WEREWOLF));
        roomRoot.put("lifecycle", "PLAYING");
        ((ObjectNode) roomRoot.withArray("players").get(0)).putNull("roleId");
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p1");
        verifyNoInteractions(messaging);

        lifecycle.invalidate("ABC234");
        service.start("ABC234", "p1", new StartGameRequest("game-003", "Kien", RoleId.WEREWOLF));
        ((ObjectNode) roomRoot.withArray("players").get(0)).put("roleId", "seer");
        clearInvocations(messaging);
        service.replayAfterPlayerConnect("ABC234", "p1");
        verifyNoInteractions(messaging);
    }

    private static StartGameRequest request() {
        return new StartGameRequest("game-001", "Kien", RoleId.WEREWOLF);
    }
}
