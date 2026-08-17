package com.masoi.room.controller;

import static org.assertj.core.api.Assertions.assertThat;

import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.PlayerPresenceStore;
import com.masoi.room.service.LobbyService;
import com.masoi.room.service.PendingPlayerRemovalScheduler;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.converter.JacksonJsonMessageConverter;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.websocket.allowed-origins=http://localhost")
@Import(RoomSocketWebSocketIntegrationTest.SchedulerConfiguration.class)
class RoomSocketWebSocketIntegrationTest {
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private static final String HOST_ID = "mP5cYgYNGxa2-WPNnTMR1Q";

    @Autowired
    StringRedisTemplate redis;
    @Autowired
    ObjectMapper mapper;
    @Autowired
    SimpMessagingTemplate messaging;
    @Autowired
    PlayerAuthStore auth;
    @Autowired
    WebSocketDisconnectListener disconnectListener;
    @Autowired
    TestScheduler scheduler;
    @LocalServerPort
    int port;
    private final List<StompSession> sessions = new ArrayList<>();

    @AfterEach
    void clean() {
        for (StompSession session : sessions) {
            try {
                session.disconnect();
            } catch (RuntimeException ignored) {
            }
        }
        scheduler.clear();
        redis.keys("room:WS" + "*").forEach(redis::delete);
        redis.keys("player:auth:WS" + "*").forEach(redis::delete);
        redis.keys("presence:room:WS" + "*").forEach(redis::delete);
        redis.keys("presence:session:*").stream()
                .filter(key -> String.valueOf(redis.opsForValue().get(key)).contains("\"roomCode\":\"WS"))
                .forEach(redis::delete);
    }

    @Test
    void handshake_accepts_configured_origin_at_ws() {
        StompSession session = connect(new Client("WS0000"));

        assertThat(session.isConnected()).isTrue();
    }

    @Test
    void authenticated_connect_publishes_public_snapshot_and_creates_presence() throws Exception {
        Seed seed = seed(2, 6);
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);

        session.send(client.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        JsonNode snapshot = client.awaitMessage();

        assertThat(snapshot.path("players")).hasSize(2);
        assertThat(snapshot.path("currentPlayers").asInt()).isEqualTo(2);
        assertThat(snapshot.at("/players/0/playerId").asString()).isEqualTo(seed.playerId());
        assertThat(snapshot.at("/players/0/isConnected").asBoolean()).isTrue();
        String reverseKey = reverseSessionKey(seed.roomCode(), seed.playerId());
        assertThat(reverseKey).isNotNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), seed.playerId())))
                .isEqualTo(reverseKey.substring("presence:session:".length()));
        assertThat(redis.opsForValue().get(reverseKey))
                .contains(seed.roomCode(), seed.playerId()).doesNotContain(seed.token(), PlayerAuthStore.digest(seed.token()));
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).path("players")).hasSize(2);
    }

    @Test
    void invalid_token_is_rejected_without_presence_or_snapshot() throws Exception {
        Seed seed = seed(1, 6);
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);

        session.send(client.connectDestination(), connectPayload(seed.playerId(), "wrong-token"));

        assertAuthenticationError(client.awaitError());
        awaitDisconnected(session);
        assertThat(client.messages.poll(250, TimeUnit.MILLISECONDS)).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), seed.playerId()))).isNull();
        assertThat(reverseSessionKey(seed.roomCode(), seed.playerId())).isNull();
    }

    @Test
    void missing_auth_is_rejected_without_presence_or_snapshot() throws Exception {
        Seed seed = seed(1, 6);
        redis.delete(PlayerAuthStore.key(seed.roomCode(), seed.playerId()));
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);

        session.send(client.connectDestination(), connectPayload(seed.playerId(), seed.token()));

        assertAuthenticationError(client.awaitError());
        awaitDisconnected(session);
        assertThat(client.messages.poll(250, TimeUnit.MILLISECONDS)).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), seed.playerId()))).isNull();
        assertThat(reverseSessionKey(seed.roomCode(), seed.playerId())).isNull();
    }

    @Test
    void unknown_player_is_rejected_with_the_same_generic_authentication_error() throws Exception {
        Seed seed = seed(1, 6);
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);

        session.send(client.connectDestination(), connectPayload("unknown-player", seed.token()));

        assertAuthenticationError(client.awaitError());
        awaitDisconnected(session);
        assertThat(client.messages.poll(250, TimeUnit.MILLISECONDS)).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), "unknown-player"))).isNull();
    }

    @Test
    void waiting_snapshot_exposes_exact_public_fields_in_room_player_order() throws Exception {
        Seed seed = seed(2, 6);
        JsonNode snapshot = connectAndReceive(seed);

        assertThat(snapshot.propertyStream().map(java.util.Map.Entry::getKey).toList())
                .containsExactlyInAnyOrder("roomCode", "status", "currentPlayers", "maxPlayers", "players", "activeRoles", "lastCompletedGame");
        assertThat(snapshot.path("status").asString()).isEqualTo("WAITING");
        assertThat(snapshot.path("roomCode").asString()).isEqualTo(seed.roomCode());
        assertThat(snapshot.path("currentPlayers").asInt()).isEqualTo(2);
        assertThat(snapshot.path("maxPlayers").asInt()).isEqualTo(6);
        assertThat(snapshot.path("activeRoles")).isEmpty();
        assertThat(snapshot.path("lastCompletedGame").isNull()).isTrue();
        assertThat(snapshot.at("/players/0/playerId").asString()).isEqualTo(seed.playerId());
        assertThat(snapshot.at("/players/0/isConnected").asBoolean()).isTrue();
        assertThat(snapshot.at("/players/1/playerId").asString()).isEqualTo(seed.otherPlayerId());
        assertThat(snapshot.at("/players/1/isConnected").asBoolean()).isFalse();
        assertPublicPlayers(snapshot);
        assertThat(mapper.writeValueAsString(snapshot)).doesNotContain("hostId", "roleId", "roles", "playerToken", "sessionId", "socketId", "digest", "presence:", "lock", "unknown");
    }

    @Test
    void full_snapshot_keeps_authoritative_waiting_status() throws Exception {
        Seed seed = seed(2, 2);
        JsonNode snapshot = connectAndReceive(seed);

        assertThat(snapshot.path("status").asString()).isEqualTo("WAITING");
        assertThat(snapshot.path("currentPlayers").asInt()).isEqualTo(2);
        assertThat(snapshot.path("maxPlayers").asInt()).isEqualTo(2);
    }

    @Test
    void protocol_uses_only_the_locked_destinations() throws Exception {
        Seed seed = seed(1, 6);
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);
        session.send(client.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        client.awaitMessage();

        assertThat(client.connectDestination()).isEqualTo("/app/rooms/" + seed.roomCode() + "/connect");
        assertThat(client.destination()).isEqualTo("/broadcast/rooms/" + seed.roomCode() + "/players");
        try (InputStream bytes = LobbyService.class.getResourceAsStream("/com/masoi/room/service/LobbyService.class")) {
            assertThat(bytes).isNotNull();
            String classContents = new String(bytes.readAllBytes(), StandardCharsets.ISO_8859_1);
            assertThat(classContents).doesNotContain("/players/status", "/presence", "/reconnect", "/disconnect", "/leave", "/player/disconnected");
        }
    }

    @Test
    void same_room_clients_receive_complete_snapshots_without_duplicate_membership() throws Exception {
        Seed seed = seed(2, 6);
        Client a = client(seed.roomCode());
        Client b = client(seed.roomCode());
        StompSession sessionA = connect(a);
        StompSession sessionB = connect(b);
        subscribe(sessionA, a.destination(), a);
        subscribe(sessionB, b.destination(), b);

        sessionA.send(a.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        assertSnapshot(a.awaitMessage(), seed.roomCode(), 2, true, false);
        assertSnapshot(b.awaitMessage(), seed.roomCode(), 2, true, false);
        sessionB.send(b.connectDestination(), connectPayload(seed.otherPlayerId(), seed.otherToken()));

        assertSnapshot(a.awaitMessage(), seed.roomCode(), 2, true, true);
        assertSnapshot(b.awaitMessage(), seed.roomCode(), 2, true, true);
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).path("players")).hasSize(2);
        assertThat(currentSessionId(seed.roomCode(), seed.playerId())).isNotNull();
        assertThat(currentSessionId(seed.roomCode(), seed.otherPlayerId())).isNotNull();
        assertThat(reverseSessionKey(seed.roomCode(), seed.playerId())).isNotNull();
        assertThat(reverseSessionKey(seed.roomCode(), seed.otherPlayerId())).isNotNull();
    }

    @Test
    void reconnect_replaces_current_session_without_changing_membership() throws Exception {
        Seed seed = seed(1, 6);
        Client a = client(seed.roomCode());
        Client b = client(seed.roomCode());
        StompSession sessionA = connect(a);
        subscribe(sessionA, a.destination(), a);
        sessionA.send(a.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        a.awaitMessage();
        String serverSessionA = currentSessionId(seed.roomCode(), seed.playerId());

        StompSession sessionB = connect(b);
        subscribe(sessionB, b.destination(), b);
        sessionB.send(b.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        assertSnapshot(b.awaitMessage(), seed.roomCode(), 1, true);

        String serverSessionB = currentSessionId(seed.roomCode(), seed.playerId());
        assertThat(serverSessionB).isNotEqualTo(serverSessionA);
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey(serverSessionB))).contains(seed.roomCode(), seed.playerId());
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey(serverSessionA))).contains(seed.roomCode(), seed.playerId());
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).path("players")).hasSize(1);
    }

    @Test
    void stale_disconnect_cannot_remove_reconnected_session_or_publish_offline_snapshot() throws Exception {
        Seed seed = seed(1, 6);
        Client a = client(seed.roomCode());
        Client b = client(seed.roomCode());
        StompSession sessionA = connect(a);
        subscribe(sessionA, a.destination(), a);
        sessionA.send(a.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        a.awaitMessage();
        String serverSessionA = currentSessionId(seed.roomCode(), seed.playerId());
        StompSession sessionB = connect(b);
        subscribe(sessionB, b.destination(), b);
        sessionB.send(b.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        b.awaitMessage();
        a.awaitMessage();
        String serverSessionB = currentSessionId(seed.roomCode(), seed.playerId());

        sessionA.disconnect();
        awaitReverseSessionRemoved(serverSessionA);

        assertThat(currentSessionId(seed.roomCode(), seed.playerId())).isEqualTo(serverSessionB);
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey(serverSessionB))).contains(seed.roomCode(), seed.playerId());
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).path("players")).hasSize(1);
        assertThat(b.messages.poll(300, TimeUnit.MILLISECONDS)).isNull();
    }

    @Test
    void current_disconnect_removes_presence_retains_membership_and_publishes_offline_snapshot() throws Exception {
        Seed seed = seed(1, 6);
        Client actor = client(seed.roomCode());
        Client observer = client(seed.roomCode());
        StompSession actorSession = connect(actor);
        StompSession observerSession = connect(observer);
        subscribe(actorSession, actor.destination(), actor);
        subscribe(observerSession, observer.destination(), observer);
        actorSession.send(actor.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        actor.awaitMessage();
        observer.awaitMessage();
        String serverSession = currentSessionId(seed.roomCode(), seed.playerId());

        actorSession.disconnect();
        JsonNode snapshot = observer.awaitMessage();

        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), seed.playerId()))).isNull();
        awaitReverseSessionRemoved(serverSession);
        assertSnapshot(snapshot, seed.roomCode(), 1, false);
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).at("/players/0/roleId").asString()).isEqualTo("wolf");
    }

    @Test
    void controlled_expiry_removes_membership_auth_and_rejects_old_credentials() throws Exception {
        Seed seed = seed(1, 6);
        Client actor = client(seed.roomCode());
        Client observer = client(seed.roomCode());
        StompSession actorSession = connect(actor);
        StompSession observerSession = connect(observer);
        subscribe(actorSession, actor.destination(), actor);
        subscribe(observerSession, observer.destination(), observer);
        actorSession.send(actor.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        actor.awaitMessage();
        observer.awaitMessage();

        actorSession.disconnect();
        assertSnapshot(observer.awaitMessage(), seed.roomCode(), 1, false);
        assertThat(scheduler.pending()).isEqualTo(1);
        scheduler.runNext();

        JsonNode removed = observer.awaitMessage();
        assertSnapshot(removed, seed.roomCode(), 0);
        assertThat(mapper.readTree(redis.opsForValue().get("room:" + seed.roomCode())).path("players")).isEmpty();
        assertThat(redis.opsForValue().get(PlayerAuthStore.key(seed.roomCode(), seed.playerId()))).isNull();
        assertThat(mapper.writeValueAsString(removed)).doesNotContain("playerToken", "digest", "sessionId", "roleId", "hostId");

        Client rejected = client(seed.roomCode());
        StompSession rejectedSession = connect(rejected);
        rejectedSession.send(rejected.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        assertAuthenticationError(rejected.awaitError());
        awaitDisconnected(rejectedSession);
    }

    @Test
    void duplicate_disconnect_is_idempotent_after_real_disconnect() throws Exception {
        Seed seed = seed(1, 6);
        Client actor = client(seed.roomCode());
        StompSession actorSession = connect(actor);
        subscribe(actorSession, actor.destination(), actor);
        actorSession.send(actor.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        actor.awaitMessage();
        String serverSession = currentSessionId(seed.roomCode(), seed.playerId());
        String roomBefore = redis.opsForValue().get("room:" + seed.roomCode());
        actorSession.disconnect();
        awaitReverseSessionRemoved(serverSession);

        var duplicate = mock(org.springframework.web.socket.messaging.SessionDisconnectEvent.class);
        when(duplicate.getSessionId()).thenReturn(serverSession);
        disconnectListener.disconnect(duplicate);

        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(seed.roomCode(), seed.playerId()))).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey(serverSession))).isNull();
        assertThat(redis.opsForValue().get("room:" + seed.roomCode())).isEqualTo(roomBefore);
    }

    @Test
    void room_lifecycle_does_not_publish_or_mutate_another_room() throws Exception {
        Seed roomA = seed(1, 6);
        Seed roomB = seed(1, 6);
        Client a = client(roomA.roomCode());
        Client aReconnect = client(roomA.roomCode());
        Client b = client(roomB.roomCode());
        StompSession sessionA = connect(a);
        StompSession sessionAReconnect = connect(aReconnect);
        StompSession sessionB = connect(b);
        subscribe(sessionA, a.destination(), a);
        subscribe(sessionAReconnect, aReconnect.destination(), aReconnect);
        subscribe(sessionB, b.destination(), b);
        sessionB.send(b.connectDestination(), connectPayload(roomB.playerId(), roomB.token()));
        b.awaitMessage();
        String roomBPresence = currentSessionId(roomB.roomCode(), roomB.playerId());
        String roomBJson = redis.opsForValue().get("room:" + roomB.roomCode());

        sessionA.send(a.connectDestination(), connectPayload(roomA.playerId(), roomA.token()));
        a.awaitMessage();
        aReconnect.awaitMessage();
        String staleSessionA = currentSessionId(roomA.roomCode(), roomA.playerId());
        sessionAReconnect.send(aReconnect.connectDestination(), connectPayload(roomA.playerId(), roomA.token()));
        aReconnect.awaitMessage();
        a.awaitMessage();
        sessionA.disconnect();
        awaitReverseSessionRemoved(staleSessionA);
        sessionAReconnect.disconnect();
        awaitCurrentPresenceRemoved(roomA.roomCode(), roomA.playerId());

        assertThat(b.messages.poll(300, TimeUnit.MILLISECONDS)).isNull();
        assertThat(currentSessionId(roomB.roomCode(), roomB.playerId())).isEqualTo(roomBPresence);
        assertThat(redis.opsForValue().get("room:" + roomB.roomCode())).isEqualTo(roomBJson);
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey(roomBPresence))).contains(roomB.roomCode(), roomB.playerId());
    }

    private JsonNode connectAndReceive(Seed seed) throws Exception {
        Client client = client(seed.roomCode());
        StompSession session = connect(client);
        subscribe(session, client.destination(), client);
        session.send(client.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        return client.awaitMessage();
    }

    @Test
    void privateRoleDeliveryRequiresTokenAndCurrentSession() throws Exception {
        Seed seed = seed(1, 6);
        Client oldClient = client(seed.roomCode());
        StompSession oldSession = connect(oldClient);
        subscribePrivate(oldSession, seed, oldClient);
        oldSession.send(oldClient.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        String oldServerSession = awaitCurrentSession(seed.roomCode(), seed.playerId(), null);

        Client currentClient = client(seed.roomCode());
        StompSession currentSession = connect(currentClient);
        subscribePrivate(currentSession, seed, currentClient);
        currentSession.send(currentClient.connectDestination(), connectPayload(seed.playerId(), seed.token()));
        awaitCurrentSession(seed.roomCode(), seed.playerId(), oldServerSession);

        messaging.convertAndSend(privateDestination(seed), mapper.createObjectNode().put("gameId", "game-001").put("playerName", "An").put("roleId", "werewolf"));
        assertThat(currentClient.awaitMessage().path("roleId").asString()).isEqualTo("werewolf");
        assertThat(oldClient.messages.poll(500, TimeUnit.MILLISECONDS)).isNull();

        Client wrong = client(seed.roomCode());
        StompSession wrongSession = connect(wrong);
        StompHeaders headers = new StompHeaders();
        headers.setDestination(privateDestination(seed));
        headers.add("X-Player-Token", "wrong-token");
        wrongSession.subscribe(headers, wrong);
        assertThat(wrong.awaitError().payload()).doesNotContain("wrong-token", seed.token(), "werewolf");
    }

    private void subscribePrivate(StompSession session, Seed seed, Client client) {
        StompHeaders headers = new StompHeaders();
        headers.setDestination(privateDestination(seed));
        headers.add("X-Player-Token", seed.token());
        session.subscribe(headers, client);
    }

    private String privateDestination(Seed seed) {
        return "/broadcast/distribution/rooms/" + seed.roomCode() + "/start-game/" + seed.playerId();
    }

    private StompSession connect(Client client) {
        try {
            WebSocketStompClient stomp = new WebSocketStompClient(new SockJsClient(List.of(new WebSocketTransport(new StandardWebSocketClient()))));
            stomp.setMessageConverter(new JacksonJsonMessageConverter());
            WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
            headers.setOrigin("http://localhost");
            StompSession session = stomp.connectAsync("http://localhost:" + port + "/ws", headers, new StompHeaders(), client).get(TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
            sessions.add(session);
            return session;
        } catch (Exception exception) {
            throw new AssertionError("STOMP connection to /ws did not complete", exception);
        }
    }

    private void subscribe(StompSession session, String destination, Client client) throws Exception {
        StompHeaders headers = new StompHeaders();
        headers.setDestination(destination);
        session.subscribe(headers, client);
        assertThat(session.isConnected()).isTrue();
    }

    private String connectPayload(String playerId, String token) throws Exception {
        ObjectNode payload = mapper.createObjectNode();
        payload.put("playerId", playerId);
        payload.put("playerToken", token);
        return mapper.writeValueAsString(payload);
    }

    private Seed seed(int players, int maxPlayers) throws Exception {
        String roomCode = "WS" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase().replace('0', 'A').replace('1', 'B');
        String playerId = "player-" + UUID.randomUUID();
        String otherPlayerId = "player-" + UUID.randomUUID();
        ObjectNode room = mapper.createObjectNode();
        room.put("roomCode", roomCode);
        room.put("hostId", HOST_ID);
        room.put("maxPlayers", maxPlayers);
        room.putObject("unknown").put("enabled", true);
        var roomPlayers = room.putArray("players");
        roomPlayers.addObject().put("playerId", playerId).put("playerName", "An").put("roleId", "wolf").put("unknownPlayer", true);
        if (players == 2)
            roomPlayers.addObject().put("playerId", otherPlayerId).put("playerName", "Binh").put("roleId", "villager").put("unknownPlayer", true);
        redis.opsForValue().set("room:" + roomCode, mapper.writeValueAsString(room));
        return new Seed(roomCode, playerId, otherPlayerId, auth.create(roomCode, playerId),
                players == 2 ? auth.create(roomCode, otherPlayerId) : null);
    }

    private Client client(String roomCode) {
        return new Client(roomCode);
    }

    private void assertSnapshot(JsonNode snapshot, String roomCode, int playerCount, boolean... connected) {
        assertThat(snapshot.propertyStream().map(java.util.Map.Entry::getKey).toList())
                .containsExactlyInAnyOrder("roomCode", "status", "currentPlayers", "maxPlayers", "players", "activeRoles", "lastCompletedGame");
        assertThat(snapshot.path("roomCode").asString()).isEqualTo(roomCode);
        assertThat(snapshot.path("currentPlayers").asInt()).isEqualTo(playerCount);
        assertThat(snapshot.path("players")).hasSize(playerCount);
        assertPublicPlayers(snapshot);
        for (int index = 0; index < connected.length; index++) {
            assertThat(snapshot.at("/players/" + index + "/isConnected").asBoolean()).isEqualTo(connected[index]);
        }
        snapshot.path("players").forEach(player -> assertThat(player.has("roleId")).isFalse());
        assertThat(mapper.writeValueAsString(snapshot)).doesNotContain("hostId", "playerToken", "sessionId", "socketId", "digest", "presence:", "lock", "roundNote", "assignment");
    }

    private void assertAuthenticationError(ErrorFrame error) throws Exception {
        JsonNode body = mapper.readTree(error.payload());
        assertThat(body.propertyStream().map(java.util.Map.Entry::getKey).toList()).containsExactly("code");
        assertThat(body.path("code").asString()).isEqualTo("SOCKET_AUTH_FAILED");
        assertThat(error.headers().getFirst("message")).isEqualTo("SOCKET_AUTH_FAILED");
        assertThat(error.payload()).doesNotContain("player-", "wrong-token", "room:", "token", "digest", "exception");
    }

    private String awaitCurrentSession(String roomCode, String playerId, String previous) throws Exception {
        long deadline = System.nanoTime() + TIMEOUT.toNanos();
        while (System.nanoTime() < deadline) {
            String value = redis.opsForValue().get(PlayerPresenceStore.currentKey(roomCode, playerId));
            if (value != null && !value.equals(previous)) return value;
            TimeUnit.MILLISECONDS.sleep(20);
        }
        throw new AssertionError("Current presence was not established");
    }

    private String currentSessionId(String roomCode, String playerId) {
        String value = redis.opsForValue().get(PlayerPresenceStore.currentKey(roomCode, playerId));
        if (value == null)
            throw new AssertionError("Current presence was not created for " + roomCode + "/" + playerId);
        return value;
    }

    private void awaitReverseSessionRemoved(String sessionId) throws Exception {
        awaitAbsent(PlayerPresenceStore.sessionKey(sessionId), "reverse session " + sessionId);
    }

    private void awaitCurrentPresenceRemoved(String roomCode, String playerId) throws Exception {
        awaitAbsent(PlayerPresenceStore.currentKey(roomCode, playerId), "current presence for " + roomCode + "/" + playerId);
    }

    private void awaitAbsent(String key, String description) throws Exception {
        long deadline = System.nanoTime() + TIMEOUT.toNanos();
        while (System.nanoTime() < deadline) {
            if (redis.opsForValue().get(key) == null) return;
            TimeUnit.MILLISECONDS.sleep(20);
        }
        throw new AssertionError("Timed out waiting for removal of " + description);
    }

    private void awaitDisconnected(StompSession session) throws Exception {
        long deadline = System.nanoTime() + TIMEOUT.toNanos();
        while (System.nanoTime() < deadline) {
            if (!session.isConnected()) return;
            TimeUnit.MILLISECONDS.sleep(20);
        }
        throw new AssertionError("STOMP session remained connected after terminal authentication error");
    }

    private String reverseSessionKey(String roomCode, String playerId) {
        return redis.keys("presence:session:*").stream()
                .filter(key -> {
                    String value = redis.opsForValue().get(key);
                    return value != null && value.contains("\"roomCode\":\"" + roomCode + "\"")
                            && value.contains("\"playerId\":\"" + playerId + "\"");
                })
                .findFirst()
                .orElse(null);
    }

    private void assertPublicPlayers(JsonNode snapshot) {
        for (JsonNode player : snapshot.path("players")) {
            assertThat(player.propertyStream().map(java.util.Map.Entry::getKey).toList())
                    .containsExactlyInAnyOrder("playerId", "playerName", "isConnected", "ready");
        }
    }

    private record Seed(String roomCode, String playerId, String otherPlayerId, String token, String otherToken) {
    }

    private final class Client extends StompSessionHandlerAdapter implements StompFrameHandler {
        private final String roomCode;
        private final BlockingQueue<JsonNode> messages = new LinkedBlockingQueue<>();
        private final CompletableFuture<ErrorFrame> error = new CompletableFuture<>();

        private Client(String roomCode) {
            this.roomCode = roomCode;
        }

        String destination() {
            return "/broadcast/rooms/" + roomCode + "/players";
        }

        String connectDestination() {
            return "/app/rooms/" + roomCode + "/connect";
        }

        @Override
        public java.lang.reflect.Type getPayloadType(StompHeaders headers) {
            return byte[].class;
        }

        @Override
        public void handleFrame(StompHeaders headers, Object payload) {
            if (payload == null) {
                error.complete(new ErrorFrame(headers, ""));
                return;
            }
            if ("SOCKET_AUTH_FAILED".equals(headers.getFirst("message"))) {
                error.complete(new ErrorFrame(headers, new String((byte[]) payload, StandardCharsets.UTF_8)));
                return;
            }
            try {
                messages.add(mapper.readTree((byte[]) payload));
            } catch (Exception exception) {
                error.completeExceptionally(exception);
            }
        }

        @Override
        public void handleException(StompSession session, org.springframework.messaging.simp.stomp.StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
            error.complete(new ErrorFrame(headers, new String(payload, StandardCharsets.UTF_8)));
        }

        @Override
        public void handleTransportError(StompSession session, Throwable exception) {
            error.completeExceptionally(exception);
        }

        ErrorFrame awaitError() throws Exception {
            return error.get(TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
        }

        JsonNode awaitMessage() throws Exception {
            JsonNode value = messages.poll(TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
            if (value == null) throw new AssertionError("No snapshot arrived before timeout: " + error.getNow(null));
            return value;
        }
    }

    private record ErrorFrame(StompHeaders headers, String payload) {
    }

    @TestConfiguration
    static class SchedulerConfiguration {
        @Bean
        @Primary
        TestScheduler testPendingPlayerRemovalScheduler() {
            return new TestScheduler();
        }
    }

    static final class TestScheduler implements PendingPlayerRemovalScheduler {
        private final List<Task> tasks = new ArrayList<>();

        @Override
        public synchronized Cancellation schedule(Runnable action) {
            Task task = new Task(action);
            tasks.add(task);
            return task;
        }

        @Override
        public synchronized void shutdown() {
            clear();
        }

        synchronized int pending() {
            return (int) tasks.stream().filter(task -> !task.ran && !task.cancelled).count();
        }

        synchronized void runNext() {
            tasks.stream().filter(task -> !task.ran && !task.cancelled).findFirst().orElseThrow().run();
        }

        synchronized void clear() {
            tasks.forEach(Task::cancel);
            tasks.clear();
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

            private void run() {
                if (!cancelled && !ran) {
                    ran = true;
                    action.run();
                }
            }
        }
    }
}
