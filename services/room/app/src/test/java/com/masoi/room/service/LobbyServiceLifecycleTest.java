package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.exception.SocketAuthenticationException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.PlayerPresenceStore;
import com.masoi.room.repository.PlayerRemovalRoomStore;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.utils.RoomLock;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class LobbyServiceLifecycleTest {
    private static final String ROOM = "A7K9Q2", PLAYER = "player-a", SESSION = "session-a", HOST = "mP5cYgYNGxa2-WPNnTMR1Q";
    private final RoomRepository rooms = mock(RoomRepository.class);
    private final PlayerAuthStore auth = mock(PlayerAuthStore.class);
    private final PlayerPresenceStore presence = mock(PlayerPresenceStore.class);
    private final PlayerRemovalRoomStore removal = mock(PlayerRemovalRoomStore.class);
    private final RoomLock lock = mock(RoomLock.class);
    private final SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
    private final FakeScheduler scheduler = new FakeScheduler();
    private LobbyService lobby;

    @BeforeEach
    void setUp() {
        lobby = new LobbyService(rooms, auth, presence, removal, lock, scheduler,
                new PendingPlayerRemovalCoordinator(), messaging);
        when(rooms.read(ROOM)).thenReturn(room(PLAYER, "player-b"));
        when(presence.findAssociation(SESSION)).thenReturn(new PlayerPresenceStore.SessionAssociation(ROOM, PLAYER));
        when(presence.disconnect(SESSION)).thenReturn(new PlayerPresenceStore.Association(ROOM, PLAYER, true));
        when(presence.connected(ROOM, PLAYER)).thenReturn(false);
    }

    @Test
    void currentDisconnectSchedulesOneTaskAndBroadcastsTheCompleteOfflineSnapshot() {
        lobby.disconnect(SESSION);

        assertThat(scheduler.tasks).hasSize(1);
        verify(messaging).convertAndSend(eq("/broadcast/rooms/" + ROOM + "/players"), any(Object.class));
        verify(auth, never()).deleteExact(any(), any());
        verify(removal, never()).remove(any(), any());
    }

    @Test
    void staleAndDuplicateDisconnectsDoNotScheduleOrBroadcast() {
        when(presence.disconnect(SESSION)).thenReturn(new PlayerPresenceStore.Association(ROOM, PLAYER, false));
        lobby.disconnect(SESSION);
        when(presence.findAssociation("missing")).thenReturn(null);
        lobby.disconnect("missing");

        assertThat(scheduler.tasks).isEmpty();
        verify(messaging, never()).convertAndSend(any(), any(Object.class));
    }

    @Test
    void reconnectInvalidatesPendingEntryEvenWhenCancellationLoses() {
        lobby.disconnect(SESSION);
        when(auth.matches(ROOM, PLAYER, "token")).thenReturn(true);
        when(presence.connected(ROOM, PLAYER)).thenReturn(true);

        lobby.connect(ROOM, new PlayerConnectRequest(PLAYER, "token"), "session-b");
        scheduler.runAllIncludingCancelled();

        verify(presence).connect(ROOM, PLAYER, "session-b");
        verify(removal, never()).remove(any(), any());
        verify(auth, never()).deleteExact(any(), any());
    }

    @Test
    void hostBootstrapValidatesHostAndBroadcastsPersistedLifecycleAndReadyState() {
        ObjectNode root = room(PLAYER, "player-b").root();
        root.put("lifecycle", "PLAYING");
        ((ObjectNode) root.withArray("players").get(0)).put("ready", true);
        root.putArray("activeRoles").addObject().put("roleId", "seer").put("quantity", 1);
        root.putObject("lastCompletedGame").put("winningSide", "VILLAGE").putArray("roles").addObject().put("roleId", "werewolf").put("quantity", 2);
        when(rooms.read(ROOM)).thenReturn(new RoomSnapshot(root, HOST, 6, 2));

        lobby.connectHost(ROOM, HOST);

        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(messaging).convertAndSend(eq("/broadcast/rooms/" + ROOM + "/players"), payload.capture());
        var snapshot = (com.masoi.room.dto.response.PlayerListSnapshot) payload.getValue();
        assertThat(snapshot.status()).isEqualTo("PLAYING");
        assertThat(snapshot.players().get(0).ready()).isTrue();
        assertThat(snapshot.activeRoles()).containsExactly(new com.masoi.room.dto.response.PublicRoleSummary("seer", 1));
        assertThat(snapshot.lastCompletedGame().winningSide()).isEqualTo("VILLAGE");
        assertThat(snapshot.toString()).doesNotContain(HOST, "roleId=null", "hostId", "roundNote");
        verify(presence, never()).connect(any(), any(), any());
    }

    @Test
    void failedReconnectAuthenticationLeavesThePendingRemovalAuthoritative() {
        lobby.disconnect(SESSION);
        when(auth.matches(ROOM, PLAYER, "wrong")).thenReturn(false);

        assertThatThrownBy(() -> lobby.connect(ROOM, new PlayerConnectRequest(PLAYER, "wrong"), "session-b"))
                .isInstanceOf(SocketAuthenticationException.class);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenReturn(new PlayerRemovalRoomStore.Removed(room("player-b")));

        scheduler.runNext();

        verify(presence, never()).connect(ROOM, PLAYER, "session-b");
        verify(removal).remove(ROOM, PLAYER);
    }

    @Test
    void timeoutWithAReplacementPresenceOnlyClearsPendingOwnership() {
        lobby.disconnect(SESSION);
        when(presence.connected(ROOM, PLAYER)).thenReturn(true);

        scheduler.runNext();

        verify(lock, never()).acquireOrThrow(any());
        verify(removal, never()).remove(any(), any());
        verify(auth, never()).deleteExact(any(), any());
    }

    @Test
    void timeoutRemovesExactPlayerUnderRoomLockThenDeletesAuthAndBroadcasts() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenReturn(new PlayerRemovalRoomStore.Removed(room("player-b")));

        scheduler.runNext();

        verify(lock).acquireOrThrow(ROOM);
        verify(removal).remove(ROOM, PLAYER);
        verify(auth).deleteExact(ROOM, PLAYER);
        verify(lock).release(ROOM, "owner");
        verify(messaging, org.mockito.Mockito.times(2)).convertAndSend(eq("/broadcast/rooms/" + ROOM + "/players"), any(Object.class));
    }

    @Test
    void lockBusyRetainsTheSameLogicalRemovalForOneDelayedRetry() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenThrow(new RoomUpdateBusyException());

        scheduler.runNext();

        assertThat(scheduler.tasks).hasSize(2);
        verify(removal, never()).remove(any(), any());
        verify(auth, never()).deleteExact(any(), any());
    }

    @Test
    void storageFailurePreservesThePendingRemovalWithoutDeletingAuthOrBroadcastingRemoval() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenThrow(new RoomStorageUnavailableException(new IllegalStateException("redis")));

        scheduler.runNext();

        assertThat(scheduler.tasks).hasSize(2);
        verify(auth, never()).deleteExact(any(), any());
        verify(messaging, org.mockito.Mockito.times(1)).convertAndSend(any(), any(Object.class));
    }

    @Test
    void alreadyAbsentDoesNotDeleteAuthOrBroadcastAgain() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenReturn(new PlayerRemovalRoomStore.AlreadyAbsent(room(PLAYER, "player-b")));

        scheduler.runNext();

        verify(auth, never()).deleteExact(any(), any());
        verify(messaging, org.mockito.Mockito.times(1)).convertAndSend(any(), any(Object.class));
    }

    @Test
    void authCleanupFailureDoesNotRollbackRemovalAndStillBroadcastsFinalSnapshot() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenReturn(new PlayerRemovalRoomStore.Removed(room("player-b")));
        doThrow(new RoomStorageUnavailableException(new IllegalStateException("redis"))).when(auth).deleteExact(ROOM, PLAYER);

        assertThatThrownBy(scheduler::runNext).isInstanceOf(RoomStorageUnavailableException.class);

        verify(messaging, org.mockito.Mockito.times(2)).convertAndSend(any(), any(Object.class));
        verify(lock).release(ROOM, "owner");
    }

    @Test
    void finalBroadcastFailureDoesNotRollbackCommittedRemovalOrAuthCleanup() {
        lobby.disconnect(SESSION);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(removal.remove(ROOM, PLAYER)).thenReturn(new PlayerRemovalRoomStore.Removed(room("player-b")));
        doThrow(new IllegalStateException("messaging")).when(messaging)
                .convertAndSend(eq("/broadcast/rooms/" + ROOM + "/players"), any(Object.class));

        assertThatThrownBy(scheduler::runNext).isInstanceOf(IllegalStateException.class);

        verify(auth).deleteExact(ROOM, PLAYER);
        verify(lock).release(ROOM, "owner");
    }

    private static RoomSnapshot room(String... playerIds) {
        ObjectNode root = new ObjectMapper().createObjectNode();
        root.put("roomCode", ROOM);
        root.put("hostId", HOST);
        root.put("maxPlayers", 6);
        for (String id : playerIds)
            root.withArray("players").addObject().put("playerId", id).put("playerName", id).putNull("roleId");
        return new RoomSnapshot(root, HOST, 6, playerIds.length);
    }

    private static final class FakeScheduler implements PendingPlayerRemovalScheduler {
        private final List<Task> tasks = new ArrayList<>();

        @Override
        public Cancellation schedule(Runnable action) {
            Task task = new Task(action);
            tasks.add(task);
            return task;
        }

        @Override
        public void shutdown() {
            tasks.forEach(Task::cancel);
        }

        void runNext() {
            tasks.stream().filter(task -> !task.ran && !task.cancelled).findFirst().orElseThrow().run();
        }

        void runAllIncludingCancelled() {
            tasks.forEach(Task::run);
        }

        private static final class Task implements Cancellation {
            private final Runnable action;
            private boolean cancelled;
            private boolean ran;

            private Task(Runnable action) {
                this.action = action;
            }

            @Override
            public boolean cancel() {
                if (cancelled || ran) return false;
                cancelled = true;
                return false;
            }

            void run() {
                if (!ran) {
                    ran = true;
                    action.run();
                }
            }
        }
    }
}
