package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.dto.response.PlayerListSnapshot;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.PlayerPresenceStore;
import com.masoi.room.repository.PlayerRemovalRoomStore;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.utils.RoomLock;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest
class PlayerDisconnectReconnectRedisIntegrationTest {
    private static final String ROOM_A = "T6A9Q2", ROOM_B = "T6B9Q2";
    private static final String PLAYER = "ttt66-player", OTHER = "ttt66-other";
    private static final String SESSION_A = "ttt66-session-a", SESSION_B = "ttt66-session-b";
    private static final String HOST = "mP5cYgYNGxa2-WPNnTMR1Q";

    @Autowired
    StringRedisTemplate redis;
    @Autowired
    ObjectMapper mapper;
    @Autowired
    RoomRepository rooms;
    @Autowired
    PlayerAuthStore auth;
    @Autowired
    PlayerPresenceStore presence;
    @Autowired
    PlayerRemovalRoomStore removals;
    @Autowired
    RoomLock lock;
    private final SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
    private FakeScheduler scheduler;
    private LobbyService lobby;

    @BeforeEach
    void setUp() {
        scheduler = new FakeScheduler();
        lobby = new LobbyService(rooms, auth, presence, removals, lock, scheduler,
                new PendingPlayerRemovalCoordinator(), messaging);
        reset(messaging);
    }

    @AfterEach
    void clean() {
        for (String room : List.of(ROOM_A, ROOM_B)) {
            redis.delete("room:" + room);
            redis.delete("lock:room:" + room);
            redis.delete(PlayerAuthStore.key(room, PLAYER));
            redis.delete(PlayerAuthStore.key(room, OTHER));
            redis.delete(PlayerPresenceStore.currentKey(room, PLAYER));
            redis.delete(PlayerPresenceStore.currentKey(room, OTHER));
        }
        redis.delete(PlayerPresenceStore.sessionKey(SESSION_A));
        redis.delete(PlayerPresenceStore.sessionKey(SESSION_B));
    }

    @Test
    void disconnectKeepsMembershipAndAuthUntilControlledExpiryRemovesOnlyTheOwner() throws Exception {
        seed(ROOM_A, PLAYER, OTHER);
        String token = auth.create(ROOM_A, PLAYER);
        String otherToken = auth.create(ROOM_A, OTHER);
        presence.connect(ROOM_A, PLAYER, SESSION_A);

        lobby.disconnect(SESSION_A);

        assertThat(scheduler.tasks).hasSize(1);
        assertThat(presence.connected(ROOM_A, PLAYER)).isFalse();
        assertThat(savedPlayers(ROOM_A)).containsExactly(PLAYER, OTHER);
        assertThat(auth.matches(ROOM_A, PLAYER, token)).isTrue();
        assertThat(auth.matches(ROOM_A, OTHER, otherToken)).isTrue();
        assertSnapshot(0, ROOM_A, 2, false, false);

        scheduler.runNext();

        assertThat(savedPlayers(ROOM_A)).containsExactly(OTHER);
        assertThat(redis.opsForValue().get(PlayerAuthStore.key(ROOM_A, PLAYER))).isNull();
        assertThat(auth.matches(ROOM_A, OTHER, otherToken)).isTrue();
        assertSnapshot(1, ROOM_A, 1, false);
        scheduler.runAllIncludingCancelled();
        assertThat(savedPlayers(ROOM_A)).containsExactly(OTHER);
        scheduler.repeat(0);
        assertThat(savedPlayers(ROOM_A)).containsExactly(OTHER);
    }

    @Test
    void reconnectBeforeExpiryPreservesIdentityOrderAuthAndInvalidatesStaleTask() throws Exception {
        seed(ROOM_A, PLAYER, OTHER);
        String token = auth.create(ROOM_A, PLAYER);
        presence.connect(ROOM_A, PLAYER, SESSION_A);
        lobby.disconnect(SESSION_A);

        lobby.connect(ROOM_A, new PlayerConnectRequest(PLAYER, token), SESSION_B);
        scheduler.runAllIncludingCancelled();

        assertThat(savedPlayers(ROOM_A)).containsExactly(PLAYER, OTHER);
        assertThat(auth.matches(ROOM_A, PLAYER, token)).isTrue();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM_A, PLAYER))).isEqualTo(SESSION_B);
        assertSnapshot(1, ROOM_A, 2, true, false);
    }

    @Test
    void samePlayerIdInDifferentRoomsExpiresIndependently() throws Exception {
        seed(ROOM_A, PLAYER);
        seed(ROOM_B, PLAYER);
        String tokenA = auth.create(ROOM_A, PLAYER), tokenB = auth.create(ROOM_B, PLAYER);
        presence.connect(ROOM_A, PLAYER, SESSION_A);
        presence.connect(ROOM_B, PLAYER, SESSION_B);

        lobby.disconnect(SESSION_A);
        scheduler.runNext();

        assertThat(savedPlayers(ROOM_A)).isEmpty();
        assertThat(savedPlayers(ROOM_B)).containsExactly(PLAYER);
        assertThat(auth.matches(ROOM_A, PLAYER, tokenA)).isFalse();
        assertThat(auth.matches(ROOM_B, PLAYER, tokenB)).isTrue();
        assertThat(presence.connected(ROOM_B, PLAYER)).isTrue();
    }

    @Test
    void differentPlayersInOneRoomExpireIndependentlyWithoutCountUnderflow() throws Exception {
        seed(ROOM_A, PLAYER, OTHER);
        auth.create(ROOM_A, PLAYER);
        auth.create(ROOM_A, OTHER);
        presence.connect(ROOM_A, PLAYER, SESSION_A);
        presence.connect(ROOM_A, OTHER, SESSION_B);

        lobby.disconnect(SESSION_A);
        lobby.disconnect(SESSION_B);
        scheduler.runNext();

        assertThat(savedPlayers(ROOM_A)).containsExactly(OTHER);
        assertThat(redis.opsForValue().get(PlayerAuthStore.key(ROOM_A, OTHER))).isNotNull();
        scheduler.runNext();
        assertThat(savedPlayers(ROOM_A)).isEmpty();
    }

    @Test
    void realRoomLockContentionRetriesAndReconnectInvalidatesTheRetry() throws Exception {
        seed(ROOM_A, PLAYER);
        String token = auth.create(ROOM_A, PLAYER);
        presence.connect(ROOM_A, PLAYER, SESSION_A);
        lobby.disconnect(SESSION_A);
        String owner = lock.acquireOrThrow(ROOM_A);
        try {
            scheduler.runNext();
            assertThat(scheduler.tasks).hasSize(2);
            assertThat(savedPlayers(ROOM_A)).containsExactly(PLAYER);
            assertThat(auth.matches(ROOM_A, PLAYER, token)).isTrue();
        } finally {
            lock.release(ROOM_A, owner);
        }

        lobby.connect(ROOM_A, new PlayerConnectRequest(PLAYER, token), SESSION_B);
        scheduler.runAllIncludingCancelled();

        assertThat(savedPlayers(ROOM_A)).containsExactly(PLAYER);
        assertThat(presence.connected(ROOM_A, PLAYER)).isTrue();
    }

    private void seed(String roomCode, String... playerIds) throws Exception {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", roomCode);
        root.put("hostId", HOST);
        root.put("maxPlayers", 6);
        root.putObject("future").put("enabled", true);
        for (String playerId : playerIds)
            root.withArray("players").addObject().put("playerId", playerId).put("playerName", playerId).putNull("roleId");
        redis.opsForValue().set("room:" + roomCode, mapper.writeValueAsString(root));
    }

    private List<String> savedPlayers(String roomCode) throws Exception {
        List<String> players = new ArrayList<>();
        for (JsonNode player : mapper.readTree(redis.opsForValue().get("room:" + roomCode)).path("players"))
            players.add(player.path("playerId").asString());
        return players;
    }

    private void assertSnapshot(int invocation, String roomCode, int count, boolean... connected) {
        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(messaging, org.mockito.Mockito.atLeast(invocation + 1)).convertAndSend(eq("/broadcast/rooms/" + roomCode + "/players"), payload.capture());
        PlayerListSnapshot snapshot = (PlayerListSnapshot) payload.getAllValues().get(invocation);
        assertThat(snapshot.currentPlayers()).isEqualTo(count);
        assertThat(snapshot.players()).hasSize(count);
        for (int index = 0; index < connected.length; index++)
            assertThat(snapshot.players().get(index).isConnected()).isEqualTo(connected[index]);
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

        void repeat(int index) {
            tasks.get(index).action.run();
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
                return true;
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
