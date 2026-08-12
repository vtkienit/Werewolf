package com.chat.app.services;

import java.time.Duration;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class DistributionRoomStoreRedisIntegrationTest {
    private static final String CODE = "ABC234", ROOM = "room:ABC234", LOCK = "lock:room:ABC234";
    @Autowired
    DistributionRoomStore store;
    @Autowired
    StringRedisTemplate redis;

    @AfterEach
    void clean() {
        redis.delete(ROOM);
        redis.delete(LOCK);
    }

    @Test
    void usesCanonicalOwnerLockAndReleasesIt() {
        redis.opsForValue().set(ROOM, room(6));
        String owner = store.locked(CODE, ignored -> redis.opsForValue().get(LOCK));
        assertThat(owner).isNotBlank().isNotEqualTo("wrong-owner");
        assertThat(redis.opsForValue().get(LOCK)).isNull();
    }

    @Test
    void doesNotReleaseAReplacementOwnersLock() {
        redis.opsForValue().set(ROOM, room(6));
        store.locked(CODE, ignored -> {
            redis.opsForValue().set(LOCK, "replacement-owner", Duration.ofSeconds(10));
            return null;
        });
        assertThat(redis.opsForValue().get(LOCK)).isEqualTo("replacement-owner");
    }

    @Test
    void readsLatestRoomOnlyAfterTheLockIsAcquired() throws Exception {
        redis.opsForValue().set(ROOM, room(6));
        redis.opsForValue().set(LOCK, "other-owner", Duration.ofSeconds(10));
        var executor = Executors.newSingleThreadExecutor();
        var result = executor.submit(() -> store.locked(CODE, value -> value.path("maxPlayers").asInt()));
        Thread.sleep(100);
        redis.opsForValue().set(ROOM, room(9));
        redis.delete(LOCK);
        assertThat(result.get()).isEqualTo(9);
        executor.shutdown();
    }

    @Test
    void boundedAcquisitionFailureDoesNotMutateRoom() {
        String original = room(6);
        redis.opsForValue().set(ROOM, original);
        redis.opsForValue().set(LOCK, "other-owner", Duration.ofSeconds(10));
        assertThatThrownBy(() -> store.locked(CODE, room -> {
            room.put("maxPlayers", 12);
            return null;
        }))
                .hasMessage("Room is busy");
        assertThat(redis.opsForValue().get(ROOM)).isEqualTo(original);
        assertThat(redis.opsForValue().get(LOCK)).isEqualTo("other-owner");
    }

    private static String room(int maxPlayers) {
        return "{\"roomCode\":\"ABC234\",\"hostId\":\"host\",\"maxPlayers\":" + maxPlayers + ",\"lifecycle\":\"WAITING\",\"players\":[]}";
    }
}
