package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

class PlayerRemovalRoomStoreTest {
    private static final String ROOM = "A7K9Q2";
    private static final String HOST = "mP5cYgYNGxa2-WPNnTMR1Q";
    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private PlayerRemovalRoomStore store;

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
        store = new PlayerRemovalRoomStore(redis, mapper);
    }

    @Test
    void removesOnlyTheExactIdAndPreservesOrderCountsAndUnknownFields() throws Exception {
        when(values.get("room:" + ROOM)).thenReturn(roomJson());

        PlayerRemovalRoomStore.RemovalResult result = store.remove(ROOM, "two");

        assertThat(result).isInstanceOf(PlayerRemovalRoomStore.Removed.class);
        assertThat(result.snapshot().playerCount()).isEqualTo(2);
        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(values).set(eq("room:" + ROOM), json.capture());
        JsonNode written = mapper.readTree(json.getValue());
        assertThat(written.path("players").valueStream().map(node -> node.path("playerId").asText()).toList()).containsExactly("one", "three");
        assertThat(written.path("maxPlayers").asInt()).isEqualTo(6);
        assertThat(written.path("future").path("enabled").asBoolean()).isTrue();
        assertThat(written.path("players").get(1).path("futurePlayer").asInt()).isEqualTo(3);
        assertThat(written.toString()).doesNotContain("playerToken", "presence:", "sessionId");
    }

    @Test
    void playerNameNeverSelectsThePlayerAndAlreadyAbsentDoesNotRewrite() {
        when(values.get("room:" + ROOM)).thenReturn(roomJson());

        PlayerRemovalRoomStore.RemovalResult result = store.remove(ROOM, "missing");

        assertThat(result).isInstanceOf(PlayerRemovalRoomStore.AlreadyAbsent.class);
        assertThat(result.snapshot().playerCount()).isEqualTo(3);
        verify(values, never()).set(anyString(), anyString());
    }

    @Test
    void removesLastPlayerWithAnEmptyList() throws Exception {
        when(values.get("room:" + ROOM)).thenReturn("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST + "\",\"maxPlayers\":6,\"players\":[{\"playerId\":\"only\",\"playerName\":\"Only\",\"roleId\":null}]}");

        PlayerRemovalRoomStore.RemovalResult result = store.remove(ROOM, "only");

        assertThat(result.snapshot().playerCount()).isZero();
        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(values).set(eq("room:" + ROOM), json.capture());
        assertThat(mapper.readTree(json.getValue()).path("players")).isEmpty();
    }

    @Test
    void translatesMissingMalformedAndRedisFailuresWithoutPartialWrite() {
        when(values.get("room:" + ROOM)).thenReturn(null);
        assertThatThrownBy(() -> store.remove(ROOM, "one")).isInstanceOf(RoomNotFoundException.class);
        when(values.get("room:" + ROOM)).thenReturn("{");
        assertThatThrownBy(() -> store.remove(ROOM, "one")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:" + ROOM)).thenThrow(new IllegalStateException("redis"));
        assertThatThrownBy(() -> store.remove(ROOM, "one")).isInstanceOf(RoomStorageUnavailableException.class);
        verify(values, never()).set(anyString(), anyString());
    }

    @Test
    void translatesWriteFailure() {
        when(values.get("room:" + ROOM)).thenReturn(roomJson());
        doThrow(new IllegalStateException("redis")).when(values).set(anyString(), anyString());

        assertThatThrownBy(() -> store.remove(ROOM, "one")).isInstanceOf(RoomStorageUnavailableException.class);
    }

    private static String roomJson() {
        return "{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST + "\",\"maxPlayers\":6,\"players\":["
                + "{\"playerId\":\"one\",\"playerName\":\"Same\",\"roleId\":null,\"futurePlayer\":1},"
                + "{\"playerId\":\"two\",\"playerName\":\"Same\",\"roleId\":null,\"futurePlayer\":2},"
                + "{\"playerId\":\"three\",\"playerName\":\"Other\",\"roleId\":null,\"futurePlayer\":3}],\"future\":{\"enabled\":true}}";
    }
}
