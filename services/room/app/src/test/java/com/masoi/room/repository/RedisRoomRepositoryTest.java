package com.masoi.room.repository;

import com.masoi.room.model.SaveRoomResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.model.Room;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class RedisRoomRepositoryTest {
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
    }

    @Test
    void atomicallyStoresExactPlainJsonWithoutMetadataTtlExistsOrLock() throws Exception {
        when(values.setIfAbsent(anyString(), anyString())).thenReturn(true);
        RedisRoomRepository repository = new RedisRoomRepository(redis, objectMapper);

        assertThat(repository.saveIfAbsent(Room.create("A7K9Q2", "mP5cYgYNGxa2-WPNnTMR1Q"))).isEqualTo(SaveRoomResult.SAVED);

        var json = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(values).setIfAbsent(org.mockito.ArgumentMatchers.eq("room:A7K9Q2"), json.capture());
        JsonNode root = objectMapper.readTree(json.getValue());
        assertThat(root.size()).isEqualTo(5);
        assertThat(root.has("roomCode") && root.has("hostId") && root.has("maxPlayers") && root.has("players")).isTrue();
        assertThat(root.path("lifecycle").asString()).isEqualTo("WAITING");
        assertThat(json.getValue()).doesNotContain("@class", "@type", "java.", "lock:room", "ttl");
        verify(redis, never()).hasKey(anyString());
    }

    @Test
    void mapsFalseToCollisionAndNullOrRedisFailureToStorageFailure() {
        RedisRoomRepository repository = new RedisRoomRepository(redis, objectMapper);
        Room room = Room.create("A7K9Q2", "host");
        when(values.setIfAbsent(anyString(), anyString())).thenReturn(false);
        assertThat(repository.saveIfAbsent(room)).isEqualTo(SaveRoomResult.COLLISION);

        when(values.setIfAbsent(anyString(), anyString())).thenReturn(null);
        assertThatThrownBy(() -> repository.saveIfAbsent(room)).isInstanceOf(RoomStorageUnavailableException.class);

        when(values.setIfAbsent(anyString(), anyString())).thenThrow(new IllegalStateException("redis detail"));
        assertThatThrownBy(() -> repository.saveIfAbsent(room)).isInstanceOf(RoomStorageUnavailableException.class);
    }

    @Test
    void mapsJacksonFailureToSerializationFailure() throws Exception {
        ObjectMapper failingMapper = mock(ObjectMapper.class);
        JacksonException failure = mock(JacksonException.class);
        when(failingMapper.writeValueAsString(org.mockito.ArgumentMatchers.any(Room.class))).thenThrow(failure);
        RedisRoomRepository repository = new RedisRoomRepository(redis, failingMapper);

        assertThatThrownBy(() -> repository.saveIfAbsent(Room.create("A7K9Q2", "host")))
                .isInstanceOf(RoomSerializationException.class);
    }
}
