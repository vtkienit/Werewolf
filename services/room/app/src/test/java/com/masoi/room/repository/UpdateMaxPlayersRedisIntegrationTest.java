package com.masoi.room.repository;

import com.masoi.room.model.RoomSnapshot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.exception.HostCredentialInvalidException;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.RedisRoomLock;
import com.masoi.room.config.RoomLockProperties;
import com.masoi.room.exception.RoomSerializationException;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;

import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.service.RoomServiceImpl;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest
class UpdateMaxPlayersRedisIntegrationTest {
    private static final String ROOM_CODE = "A7K9Q2";
    private static final String ROOM_KEY = "room:A7K9Q2";
    private static final String LOCK_KEY = "lock:room:A7K9Q2";
    private static final String HOST_ID = "mP5cYgYNGxa2-WPNnTMR1Q";

    @Autowired
    StringRedisTemplate redis;
    @Autowired
    RoomLock lock;
    @Autowired
    UpdateMaxPlayersRoomStore store;
    @Autowired
    RoomServiceImpl service;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    RoomLockProperties lockProperties;

    @BeforeEach
    void cleanBefore() {
        redis.delete(ROOM_KEY);
        redis.delete(LOCK_KEY);
    }

    @AfterEach
    void cleanAfter() {
        redis.delete(ROOM_KEY);
        redis.delete(LOCK_KEY);
    }

    private String roomJson(int maxPlayers, int playerCount) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("roomCode", ROOM_CODE);
        root.put("hostId", HOST_ID);
        root.put("maxPlayers", maxPlayers);
        ArrayNode players = root.putArray("players");
        for (int index = 0; index < playerCount; index++) {
            ObjectNode player = players.addObject();
            player.put("playerId", "P" + index);
            player.put("playerName", "Player" + index);
            player.putNull("roleId");
        }
        return root.toString();
    }

    @Test
    void realLockAcquireSetsKeyAndOwnerOnlyReleaseDeletesIt() {
        String token = lock.acquireOrThrow(ROOM_CODE);
        assertThat(redis.opsForValue().get(LOCK_KEY)).isEqualTo(token);

        lock.release(ROOM_CODE, "wrong-owner");
        assertThat(redis.opsForValue().get(LOCK_KEY)).isEqualTo(token);

        lock.release(ROOM_CODE, token);
        assertThat(redis.opsForValue().get(LOCK_KEY)).isNull();
    }

    @Test
    void configuredLockContractUsesTwoSecondTimeoutTenSecondLeaseAndFiftyMillisecondRetry() {
        assertThat(lockProperties.acquisitionTimeout()).isEqualTo(Duration.ofSeconds(2));
        assertThat(lockProperties.leaseDuration()).isEqualTo(Duration.ofSeconds(10));
        assertThat(lockProperties.retryInterval()).isEqualTo(Duration.ofMillis(50));
    }

    @Test
    void expiredOwnerCannotDeleteSuccessorLock() {
        String firstToken = lock.acquireOrThrow(ROOM_CODE);
        redis.delete(LOCK_KEY);
        String secondToken = lock.acquireOrThrow(ROOM_CODE);

        lock.release(ROOM_CODE, firstToken);
        assertThat(redis.opsForValue().get(LOCK_KEY)).isEqualTo(secondToken);

        lock.release(ROOM_CODE, secondToken);
        assertThat(redis.opsForValue().get(LOCK_KEY)).isNull();
    }

    @Test
    void genuinelyExpiredOwnerCannotDeleteSuccessorLock() throws Exception {
        AtomicInteger sequence = new AtomicInteger();
        RedisRoomLock shortLeaseLock = new RedisRoomLock(redis, () -> "owner-" + sequence.incrementAndGet(),
                new RoomLockProperties(Duration.ofSeconds(1), Duration.ofMillis(40), Duration.ofMillis(5)));
        String firstToken = shortLeaseLock.acquireOrThrow(ROOM_CODE);
        Thread.sleep(80L);
        String secondToken = shortLeaseLock.acquireOrThrow(ROOM_CODE);

        shortLeaseLock.release(ROOM_CODE, firstToken);
        assertThat(redis.opsForValue().get(LOCK_KEY)).isEqualTo(secondToken);
        shortLeaseLock.release(ROOM_CODE, secondToken);
    }

    @Test
    void realRoomWriteOnlyChangesMaxPlayersAndPreservesPlayers() {
        String original = roomJson(6, 2);
        redis.opsForValue().set(ROOM_KEY, original);

        RoomSnapshot snapshot = store.read(ROOM_CODE);
        snapshot.root().put("maxPlayers", 11);
        store.write(ROOM_CODE, snapshot.root());

        JsonNode after = objectMapper.readTree(redis.opsForValue().get(ROOM_KEY));
        assertThat(after.size()).isEqualTo(4);
        assertThat(after.get("maxPlayers").asInt()).isEqualTo(11);
        assertThat(after.get("players")).isEqualTo(objectMapper.readTree(original).get("players"));
    }

    @Test
    void realRoomWritePreservesUnknownTopLevelFields() {
        ObjectNode original = (ObjectNode) objectMapper.readTree(roomJson(6, 1));
        original.putObject("futureField").put("enabled", true);
        redis.opsForValue().set(ROOM_KEY, original.toString());

        assertThat(service.updateMaxPlayers(ROOM_CODE, HOST_ID, 8).maxPlayers()).isEqualTo(8);

        JsonNode after = objectMapper.readTree(redis.opsForValue().get(ROOM_KEY));
        assertThat(after.path("futureField").path("enabled").asBoolean()).isTrue();
        assertThat(after.path("players").size()).isEqualTo(1);
    }

    @Test
    void existingRoomPreservedOnBelowPlayerCountFailure() {
        String original = roomJson(12, 8);
        redis.opsForValue().set(ROOM_KEY, original);

        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 7))
                .isInstanceOf(MaxPlayersBelowPlayerCountException.class);
        assertThat(redis.opsForValue().get(ROOM_KEY)).isEqualTo(original);
    }

    @Test
    void existingRoomPreservedOnWrongHostFailure() {
        String original = roomJson(8, 0);
        redis.opsForValue().set(ROOM_KEY, original);

        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, "wrong-host", 9))
                .isInstanceOf(HostCredentialInvalidException.class);
        assertThat(redis.opsForValue().get(ROOM_KEY)).isEqualTo(original);
    }

    @Test
    void sameValueUpdateCanonicalizesMissingLifecycle() {
        String original = roomJson(6, 0);
        redis.opsForValue().set(ROOM_KEY, original);

        UpdateMaxPlayersResponse result = service.updateMaxPlayers(ROOM_CODE, HOST_ID, 6);
        assertThat(result).isEqualTo(new UpdateMaxPlayersResponse(6));
        assertThat(objectMapper.readTree(redis.opsForValue().get(ROOM_KEY)).path("lifecycle").asText()).isEqualTo("WAITING");
    }

    @Test
    void malformedOverflowRoomRemainsUnchangedAndIsNeverRewritten() {
        String malformed = "{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST_ID
                + "\",\"maxPlayers\":9223372036854775807,\"players\":[]}";
        redis.opsForValue().set(ROOM_KEY, malformed);
        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9)).isInstanceOf(RoomSerializationException.class);
        assertThat(redis.opsForValue().get(ROOM_KEY)).isEqualTo(malformed);
    }

    @Test
    void malformedStoredHostIdProducesInternalStorageFailureAndRemainsUnchanged() {
        String malformed = "{\"roomCode\":\"A7K9Q2\",\"hostId\":\"h\",\"maxPlayers\":6,\"players\":[]}";
        redis.opsForValue().set(ROOM_KEY, malformed);

        assertThatThrownBy(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9))
                .isInstanceOf(RoomSerializationException.class)
                .isNotInstanceOf(HostCredentialInvalidException.class);
        assertThat(redis.opsForValue().get(ROOM_KEY)).isEqualTo(malformed);
    }

    @Test
    void twoConcurrentPatchesAreSerializedWithNoLostUpdate() throws Exception {
        redis.opsForValue().set(ROOM_KEY, roomJson(6, 0));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        Future<UpdateMaxPlayersResponse> first = executor.submit(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9));
        Future<UpdateMaxPlayersResponse> second = executor.submit(() -> service.updateMaxPlayers(ROOM_CODE, HOST_ID, 12));
        assertThat(first.get()).isEqualTo(new UpdateMaxPlayersResponse(9));
        assertThat(second.get()).isEqualTo(new UpdateMaxPlayersResponse(12));
        executor.shutdown();

        JsonNode finalRoom = objectMapper.readTree(redis.opsForValue().get(ROOM_KEY));
        assertThat(finalRoom.size()).isEqualTo(5);
        assertThat(finalRoom.get("maxPlayers").asInt()).isIn(9, 12);
        assertThat(finalRoom.get("players").isArray()).isTrue();
    }

    @Test
    void explicitNullLifecycleIsCanonicalizedOnMutation() throws Exception {
        ObjectNode room = (ObjectNode) objectMapper.readTree(roomJson(6, 0));
        room.putNull("lifecycle");
        redis.opsForValue().set(ROOM_KEY, room.toString());
        service.updateMaxPlayers(ROOM_CODE, HOST_ID, 9);
        JsonNode stored = objectMapper.readTree(redis.opsForValue().get(ROOM_KEY));
        assertThat(stored.path("lifecycle").asText()).isEqualTo("WAITING");
        assertThat(stored.path("maxPlayers").asInt()).isEqualTo(9);
    }
}
