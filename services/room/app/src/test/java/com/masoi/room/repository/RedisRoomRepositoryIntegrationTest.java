package com.masoi.room.repository;

import com.masoi.room.model.SaveRoomResult;

import static org.assertj.core.api.Assertions.assertThat;

import com.masoi.room.model.Room;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

@SpringBootTest
class RedisRoomRepositoryIntegrationTest {
    private static final String KEY = "room:A7K9Q2";

    @Autowired
    RedisRoomRepository repository;
    @Autowired
    StringRedisTemplate redis;

    @AfterEach
    void cleanUp() {
        redis.delete(KEY);
    }

    @Test
    void setNxCreatesOnceAndNeverOverwrites() {
        redis.delete(KEY);
        assertThat(repository.saveIfAbsent(Room.create("A7K9Q2", "first-host"))).isEqualTo(SaveRoomResult.SAVED);
        String firstJson = redis.opsForValue().get(KEY);
        assertThat(repository.saveIfAbsent(Room.create("A7K9Q2", "second-host"))).isEqualTo(SaveRoomResult.COLLISION);
        assertThat(redis.opsForValue().get(KEY)).isEqualTo(firstJson);
        assertThat(redis.getExpire(KEY)).isEqualTo(-1L);
    }
}
