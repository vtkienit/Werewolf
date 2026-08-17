package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.exception.SocketAuthenticationException;
import com.masoi.room.service.LobbyService;
import com.masoi.room.service.RoomService;
import com.masoi.room.service.RoomServiceImpl;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.utils.HostIdGenerator;
import com.masoi.room.utils.PlayerIdGenerator;
import com.masoi.room.utils.QrUrlFactory;
import com.masoi.room.utils.RoomCodeGenerator;
import com.masoi.room.utils.RoomLock;

import java.util.List;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import static org.mockito.Mockito.*;

@SpringBootTest
class PlayerAuthRedisIntegrationTest {
    private static final String ROOM_A = "A7K9Q2";
    private static final String ROOM_B = "B7K9Q2";
    @Autowired
    StringRedisTemplate redis;
    @Autowired
    ObjectMapper mapper;
    @Autowired
    RoomService rooms;
    @Autowired
    LobbyService lobby;
    @Autowired
    PlayerAuthStore auth;
    private final Set<String> joinedPlayerIds = new HashSet<>();

    @BeforeEach
    @AfterEach
    void clean() {
        for (String room : List.of(ROOM_A, ROOM_B)) {
            redis.delete("room:" + room);
            redis.delete("lock:room:" + room);
            for (String player : List.of("id-a", "id-b", "orphan", "id-clean", "id-orphan"))
                redis.delete(PlayerAuthStore.key(room, player));
            for (String player : joinedPlayerIds) {
                redis.delete(PlayerAuthStore.key(room, player));
                redis.delete(PlayerPresenceStore.currentKey(room, player));
            }
        }
        for (String session : List.of("auth-a", "auth-b", "auth-cross"))
            redis.delete(PlayerPresenceStore.sessionKey(session));
        joinedPlayerIds.clear();
    }

    @Test
    void join_persists_digest_only_and_authenticates_membership() throws Exception {
        seed(ROOM_A);
        var joined = join(ROOM_A, " Alice ");
        String value = redis.opsForValue().get(PlayerAuthStore.key(ROOM_A, joined.playerId()));
        String rawRoom = redis.opsForValue().get("room:" + ROOM_A);
        assertThat(joined.playerToken()).matches("[A-Za-z0-9_-]{22}");
        assertThat(value).isEqualTo(PlayerAuthStore.digest(joined.playerToken())).isNotEqualTo(joined.playerToken()).doesNotContain(joined.playerName());
        assertThat(rawRoom).doesNotContain(joined.playerToken());
        lobby.connect(ROOM_A, new PlayerConnectRequest(joined.playerId(), joined.playerToken()), "auth-a");
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM_A, joined.playerId()))).isEqualTo("auth-a");
    }

    @Test
    void rejects_wrong_missing_unknown_cross_room_and_orphan_credentials() throws Exception {
        seed(ROOM_A);
        seed(ROOM_B);
        var a = join(ROOM_A, "Alice");
        var b = join(ROOM_B, "Bob");
        assertFails(ROOM_A, a.playerId(), "wrong", "auth-a");
        redis.delete(PlayerAuthStore.key(ROOM_A, a.playerId()));
        assertFails(ROOM_A, a.playerId(), a.playerToken(), "auth-a");
        assertFails(ROOM_A, "unknown", b.playerToken(), "auth-a");
        assertFails(ROOM_B, b.playerId(), a.playerToken(), "auth-cross");
        String orphan = auth.create(ROOM_A, "orphan");
        assertFails(ROOM_A, "orphan", orphan, "auth-cross");
    }

    @Test
    void rejects_another_players_blank_and_malformed_tokens_without_creating_presence() throws Exception {
        seed(ROOM_A);
        var a = join(ROOM_A, "Alice");
        var b = join(ROOM_A, "Bob");
        assertFails(ROOM_A, b.playerId(), a.playerToken(), "auth-b");
        assertFails(ROOM_A, a.playerId(), "", "auth-a");
        assertFails(ROOM_A, a.playerId(), "   ", "auth-a");
        assertFails(ROOM_A, a.playerId(), "not/a/token=", "auth-a");
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey("auth-a"))).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey("auth-b"))).isNull();
    }

    @Test
    void token_enabled_join_preserves_unknown_json_without_persisting_credentials() throws Exception {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", ROOM_A);
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", 6);
        root.putObject("future").put("enabled", true);
        root.putArray("players").addObject().put("playerId", "existing").put("playerName", "Old").putNull("roleId").put("futurePlayer", 7);
        redis.opsForValue().set("room:" + ROOM_A, mapper.writeValueAsString(root));
        var joined = join(ROOM_A, "Alice");
        var saved = mapper.readTree(redis.opsForValue().get("room:" + ROOM_A));
        assertThat(saved.path("future").path("enabled").asBoolean()).isTrue();
        assertThat(saved.path("players").get(0).path("futurePlayer").asInt()).isEqualTo(7);
        assertThat(saved.path("players").get(1).size()).isEqualTo(4);
        assertThat(saved.path("players").get(1).path("playerId").asString()).isEqualTo(joined.playerId());
        assertThat(saved.path("players").get(1).path("playerName").asString()).isEqualTo("Alice");
        assertThat(saved.path("players").get(1).path("roleId").isNull()).isTrue();
        assertThat(saved.path("players").get(1).path("ready").asBoolean()).isFalse();
        assertThat(mapper.writeValueAsString(saved)).doesNotContain(joined.playerToken(), PlayerAuthStore.digest(joined.playerToken()));
        assertThat(redis.hasKey(PlayerAuthStore.key(ROOM_A, joined.playerId()))).isTrue();
    }

    @Test
    void write_failure_cleans_real_auth_key_and_preserves_original_failure() {
        RoomRepository repository = mock(RoomRepository.class);
        RoomLock lock = mock(RoomLock.class);
        ObjectNode root = emptyRoom(ROOM_A);
        when(repository.read(ROOM_A)).thenReturn(snapshot(root));
        when(lock.acquireOrThrow(ROOM_A)).thenReturn("lock");
        doThrow(new RoomStorageUnavailableException(new IllegalStateException("room write"))).when(repository).write(eq(ROOM_A), any());
        PlayerAuthStore authSpy = spy(new PlayerAuthStore(redis));
        var observed = new java.util.concurrent.atomic.AtomicBoolean();
        doAnswer(call -> {
            observed.set(redis.hasKey(PlayerAuthStore.key(ROOM_A, "id-clean")));
            return call.callRealMethod();
        }).when(authSpy).delete(ROOM_A, "id-clean");
        RoomServiceImpl service = service(repository, lock, authSpy, "id-clean");
        assertThatThrownBy(() -> service.joinRoom(ROOM_A, new JoinRoomRequest("Alice"))).isInstanceOf(RoomStorageUnavailableException.class).hasCauseInstanceOf(IllegalStateException.class);
        assertThat(observed.get()).isTrue();
        assertThat(redis.hasKey(PlayerAuthStore.key(ROOM_A, "id-clean"))).isFalse();
        assertThat(root.withArray("players").size()).isEqualTo(1);
    }

    @Test
    void cleanup_failure_does_not_mask_room_failure_and_orphan_cannot_authenticate() {
        RoomRepository repository = mock(RoomRepository.class);
        RoomLock lock = mock(RoomLock.class);
        ObjectNode root = emptyRoom(ROOM_A);
        when(repository.read(ROOM_A)).thenReturn(snapshot(root));
        when(lock.acquireOrThrow(ROOM_A)).thenReturn("lock");
        doThrow(new RoomStorageUnavailableException(new IllegalStateException("room write"))).when(repository).write(eq(ROOM_A), any());
        PlayerAuthStore authSpy = spy(new PlayerAuthStore(redis));
        var orphanToken = new java.util.concurrent.atomic.AtomicReference<String>();
        doAnswer(call -> {
            String token = (String) call.callRealMethod();
            orphanToken.set(token);
            return token;
        }).when(authSpy).create(ROOM_A, "id-orphan");
        doThrow(new RuntimeException("cleanup failed")).when(authSpy).delete(ROOM_A, "id-orphan");
        RoomServiceImpl service = service(repository, lock, authSpy, "id-orphan");
        assertThatThrownBy(() -> service.joinRoom(ROOM_A, new JoinRoomRequest("Alice"))).isInstanceOf(RoomStorageUnavailableException.class).hasCauseInstanceOf(IllegalStateException.class);
        assertThat(redis.hasKey(PlayerAuthStore.key(ROOM_A, "id-orphan"))).isTrue();
        assertFails(ROOM_A, "id-orphan", orphanToken.get(), "auth-cross");
    }

    private void assertFails(String room, String player, String token, String session) {
        assertThatThrownBy(() -> lobby.connect(room, new PlayerConnectRequest(player, token), session)).isInstanceOf(SocketAuthenticationException.class).hasMessage("SOCKET_AUTH_FAILED");
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(room, player))).isNull();
    }

    private com.masoi.room.dto.response.JoinRoomResponse join(String room, String playerName) {
        var joined = rooms.joinRoom(room, new JoinRoomRequest(playerName));
        joinedPlayerIds.add(joined.playerId());
        return joined;
    }

    private RoomServiceImpl service(RoomRepository repository, RoomLock lock, PlayerAuthStore store, String id) {
        return new RoomServiceImpl(mock(HostIdGenerator.class), mock(RoomCodeGenerator.class), repository, mock(QrUrlFactory.class), lock, mock(UpdateMaxPlayersRoomStore.class), (PlayerIdGenerator) () -> id, store);
    }

    private ObjectNode emptyRoom(String code) {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", code);
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", 6);
        root.putArray("players");
        return root;
    }

    private RoomSnapshot snapshot(ObjectNode root) {
        return new RoomSnapshot(root, root.path("hostId").asString(), root.path("maxPlayers").asInt(), root.withArray("players").size());
    }

    private void seed(String code) throws Exception {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", code);
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", 6);
        root.putArray("players");
        redis.opsForValue().set("room:" + code, mapper.writeValueAsString(root));
    }
}
