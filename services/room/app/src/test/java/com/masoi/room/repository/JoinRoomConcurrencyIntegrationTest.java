package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.exception.RoomFullException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.exception.JoinRoomSerializationException;
import com.masoi.room.service.RoomService;
import com.masoi.room.utils.RoomLock;

import java.util.concurrent.*;
import java.util.HashSet;
import java.util.Set;

import com.masoi.room.dto.response.JoinRoomResponse;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest
class JoinRoomConcurrencyIntegrationTest {
    private static final String CODE = "A7K9Q2", KEY = "room:" + CODE, LOCK = "lock:room:" + CODE, HOST = "mP5cYgYNGxa2-WPNnTMR1Q";
    @Autowired
    StringRedisTemplate redis;
    @Autowired
    RoomService service;
    @Autowired
    RoomLock lock;
    @Autowired
    ObjectMapper mapper;
    private final Set<String> joinedPlayerIds = new HashSet<>();

    @BeforeEach
    @AfterEach
    void clear() {
        for (String playerId : joinedPlayerIds) redis.delete(PlayerAuthStore.key(CODE, playerId));
        joinedPlayerIds.clear();
        redis.delete(KEY);
        redis.delete(LOCK);
    }

    @Test
    void twoConcurrentJoinsSerializeAtCapacity() throws Exception {
        redis.opsForValue().set(KEY, room(6, 5));
        Result[] results = run(() -> service.joinRoom(CODE, new JoinRoomRequest("Alice")), () -> service.joinRoom(CODE, new JoinRoomRequest("Bob")));
        track(results);
        assertThat(successes(results)).isEqualTo(1);
        assertThat(failures(results, RoomFullException.class)).isEqualTo(1);
        assertThat(saved().path("players").size()).isEqualTo(6);
    }

    @Test
    void increaseAndJoinHaveSerializableFinalState() throws Exception {
        redis.opsForValue().set(KEY, room(6, 5));
        Result[] results = run(() -> service.updateMaxPlayers(CODE, HOST, 8), () -> service.joinRoom(CODE, new JoinRoomRequest("Alice")));
        track(results);
        assertThat(successes(results)).isEqualTo(2);
        assertThat(saved().path("maxPlayers").asInt()).isEqualTo(8);
        assertThat(saved().path("players").size()).isEqualTo(6);
    }

    @Test
    void decreaseAndJoinNeverCreatesSixOfSeven() throws Exception {
        redis.opsForValue().set(KEY, room(8, 6));
        Result[] results = run(() -> service.updateMaxPlayers(CODE, HOST, 6), () -> service.joinRoom(CODE, new JoinRoomRequest("Alice")));
        JsonNode result = saved();
        assertThat(result.path("maxPlayers").asInt() == 6 && result.path("players").size() == 7).isFalse();
        track(results);
        assertThat(successes(results)).isEqualTo(1);
        assertThat(failures(results, MaxPlayersBelowPlayerCountException.class) + failures(results, RoomFullException.class)).isEqualTo(1);
    }

    @Test
    void lockTimeoutLeavesRoomUnchanged() {
        String code = "C7K9Q2", key = "room:" + code, lockKey = "lock:room:" + code;
        String original = room(code, 6, 0);
        redis.opsForValue().set(key, original);
        String owner = lock.acquireOrThrow(code);
        try {
            assertThat(redis.hasKey(lockKey)).isTrue();
            org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.joinRoom(code, new JoinRoomRequest("Alice"))).isInstanceOf(RoomUpdateBusyException.class);
            assertThat(redis.opsForValue().get(key)).isEqualTo(original);
        } finally {
            lock.release(code, owner);
            redis.delete(key);
            redis.delete(lockKey);
        }
    }

    @Test
    void joinFailureReleasesLockForTheNextMutation() {
        redis.opsForValue().set(KEY, "{");
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.joinRoom(CODE, new JoinRoomRequest("Alice")))
                .isInstanceOf(JoinRoomSerializationException.class);
        redis.opsForValue().set(KEY, room(6, 0));
        assertThat(service.updateMaxPlayers(CODE, HOST, 7).maxPlayers()).isEqualTo(7);
        assertThat(redis.opsForValue().get(LOCK)).isNull();
    }

    @Test
    void heldLockForOneRoomDoesNotBlockAnotherRoom() {
        String secondCode = "B8M2P4", secondKey = "room:" + secondCode, secondLock = "lock:room:" + secondCode;
        redis.opsForValue().set(KEY, room(6, 0));
        redis.opsForValue().set(secondKey, room(secondCode, 6, 0));
        redis.opsForValue().set(LOCK, "other-owner", java.time.Duration.ofSeconds(3));
        try {
            assertThat(service.joinRoom(secondCode, new JoinRoomRequest("Alice")).playerName()).isEqualTo("Alice");
            assertThat(mapper.readTree(redis.opsForValue().get(secondKey)).path("players").size()).isEqualTo(1);
            assertThat(redis.opsForValue().get(LOCK)).isEqualTo("other-owner");
        } finally {
            redis.delete(secondKey);
            redis.delete(secondLock);
        }
    }

    private Result[] run(Callable<?> first, Callable<?> second) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2), start = new CountDownLatch(1);
        Future<Result> a = executor.submit(() -> invoke(first, ready, start));
        Future<Result> b = executor.submit(() -> invoke(second, ready, start));
        assertThat(ready.await(2, TimeUnit.SECONDS)).isTrue();
        start.countDown();
        Result[] out = {a.get(5, TimeUnit.SECONDS), b.get(5, TimeUnit.SECONDS)};
        executor.shutdown();
        return out;
    }

    private Result invoke(Callable<?> operation, CountDownLatch ready, CountDownLatch start) {
        ready.countDown();
        try {
            start.await();
            return new Result(operation.call(), null);
        } catch (Throwable e) {
            return new Result(null, e);
        }
    }

    private void track(Result[] results) {
        java.util.Arrays.stream(results).map(Result::value).filter(JoinRoomResponse.class::isInstance).map(JoinRoomResponse.class::cast).map(JoinRoomResponse::playerId).forEach(joinedPlayerIds::add);
    }

    private int successes(Result[] results) {
        return (int) java.util.Arrays.stream(results).filter(r -> r.failure == null).count();
    }

    private int failures(Result[] results, Class<?> type) {
        return (int) java.util.Arrays.stream(results).filter(r -> type.isInstance(r.failure)).count();
    }

    private JsonNode saved() throws Exception {
        return mapper.readTree(redis.opsForValue().get(KEY));
    }

    private String room(int max, int players) {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", CODE);
        root.put("hostId", HOST);
        root.put("maxPlayers", max);
        for (int i = 0; i < players; i++)
            root.withArray("players").addObject().put("playerId", "p" + i).put("playerName", "P" + i).putNull("roleId");
        if (!root.has("players")) root.putArray("players");
        return root.toString();
    }

    private String room(String code, int max, int players) {
        return room(max, players).replace(CODE, code);
    }

    private record Result(Object value, Throwable failure) {
    }
}
