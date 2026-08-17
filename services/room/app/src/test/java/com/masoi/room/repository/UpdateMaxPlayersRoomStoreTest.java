package com.masoi.room.repository;

import com.masoi.room.model.RoomSnapshot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class UpdateMaxPlayersRoomStoreTest {
    private static final String HOST_ID = "mP5cYgYNGxa2-WPNnTMR1Q";
    private static final String SECOND_HOST_ID = "AAAAAAAAAAAAAAAAAAAAAA";
    private static final String PRESERVATION_FIXTURE = "{\"roomCode\":\"A7K9Q2\",\"hostId\":\"mP5cYgYNGxa2-WPNnTMR1Q\",\"maxPlayers\":6,\"players\":["
            + "{\"playerId\":\"P001\",\"playerName\":\"Kien\",\"roleId\":null},"
            + "{\"unknownFutureField\":true,\"nested\":{\"a\":1,\"b\":[2,3]},\"tags\":[\"x\",\"y\"]},"
            + "{\"unicode\":\"thÃ nh viÃªn\",\"emoji\":\"ðŸº\"},"
            + "{\"nullField\":null,\"deep\":[{\"k\":[null,true,false]}]}"
            + "]}";

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private UpdateMaxPlayersRoomStore store;

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
        store = new UpdateMaxPlayersRoomStore(redis, objectMapper);
    }

    @Test
    void readReturnsNullWhenRoomMissing() {
        when(values.get("room:A7K9Q2")).thenReturn(null);
        assertThat(store.read("A7K9Q2")).isNull();
    }

    @Test
    void readParsesLockedStructureAndCountsPlayersWithoutBindingPlayer() {
        when(values.get("room:A7K9Q2")).thenReturn(PRESERVATION_FIXTURE);
        RoomSnapshot snapshot = store.read("A7K9Q2");
        assertThat(snapshot.hostId()).isEqualTo("mP5cYgYNGxa2-WPNnTMR1Q");
        assertThat(snapshot.maxPlayers()).isEqualTo(6);
        assertThat(snapshot.playerCount()).isEqualTo(4);
    }

    @Test
    void readAcceptsCanonicalHostIdsProducedFromExactlySixteenBytes() {
        for (String hostId : List.of(HOST_ID, SECOND_HOST_ID)) {
            when(values.get("room:A7K9Q2")).thenReturn(validRoomWithHostId(hostId));
            assertThat(store.read("A7K9Q2").hostId()).isEqualTo(hostId);
        }
    }

    @Test
    void readRejectsEveryMalformedStoredHostIdWithoutWritingOrRepairing() {
        List<String> malformedHostValues = List.of(
                "\"\"",
                "\" \"",
                "\"h\"",
                "\"AAAAAAAAAAAAAAAAAAAAA\"",
                "\"AAAAAAAAAAAAAAAAAAAAAAA\"",
                "\"mP5cYgYNGxa2-WPNnTMR1=\"",
                "\"mP5cYgYNGxa2+WPNnTMR1Q\"",
                "\"mP5cYgYNGxa2/WPNnTMR1Q\"",
                "\"mP5cYgYNGxa2!WPNnTMR1Q\"",
                "\"AAAAAAAAAAAAAAAAAAAA\"",
                "\"AAAAAAAAAAAAAAAAAAAAAAA\"",
                "\"mP5cYgYNGxa2-WPNnTMR1R\"",
                "null",
                "123",
                "{}",
                "[]");

        for (String malformedHostValue : malformedHostValues) {
            String stored = roomJsonWithHostProperty("\"hostId\":" + malformedHostValue);
            when(values.get("room:A7K9Q2")).thenReturn(stored);
            assertThatThrownBy(() -> store.read("A7K9Q2"))
                    .as("stored hostId %s", malformedHostValue)
                    .isInstanceOf(RoomSerializationException.class);
        }

        String missingHostId = roomJsonWithHostProperty(null);
        when(values.get("room:A7K9Q2")).thenReturn(missingHostId);
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        verify(values, never()).set(anyString(), anyString());
    }

    @Test
    void readMapsMalformedStoredRoomToSerializationFailure() {
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"A7K9Q2\"}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"B8M2P4\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":6,\"players\":[]}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"a7k9q2\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":6,\"players\":[]}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"BAD\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":6,\"players\":[]}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":9223372036854775807,\"players\":[]}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        verify(values, never()).set(anyString(), anyString());
        when(values.get("room:A7K9Q2")).thenReturn("[1,2,3]");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":\"6\",\"players\":[]}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
        when(values.get("room:A7K9Q2")).thenReturn("{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST_ID + "\",\"maxPlayers\":6,\"players\":{}}");
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomSerializationException.class);
    }

    @Test
    void readMapsRedisFailureToStorageUnavailable() {
        when(values.get("room:A7K9Q2")).thenThrow(new IllegalStateException("redis detail"));
        assertThatThrownBy(() -> store.read("A7K9Q2")).isInstanceOf(RoomStorageUnavailableException.class);
    }

    @Test
    void writeOnlyChangesMaxPlayersAndPreservesEveryPlayerNodeOrderingAndUnknownFields() {
        when(values.get("room:A7K9Q2")).thenReturn(PRESERVATION_FIXTURE);
        RoomSnapshot snapshot = store.read("A7K9Q2");
        snapshot.root().put("maxPlayers", 12);

        store.write("A7K9Q2", snapshot.root());

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(values).set(eq("room:A7K9Q2"), captor.capture());
        String written = captor.getValue();
        assertThat(written).doesNotContain("@class", "@type", "java.", "lock:room", "ttl", "status", "version", "roleConfig");
        JsonNode writtenRoot = objectMapper.readTree(written);
        assertThat(writtenRoot.size()).isEqualTo(4);
        assertThat(writtenRoot.get("maxPlayers").asInt()).isEqualTo(12);
        assertThat(writtenRoot.get("roomCode").asString()).isEqualTo("A7K9Q2");
        assertThat(writtenRoot.get("hostId").asString()).isEqualTo("mP5cYgYNGxa2-WPNnTMR1Q");
        JsonNode originalPlayers = objectMapper.readTree(PRESERVATION_FIXTURE).get("players");
        assertThat(writtenRoot.get("players")).isEqualTo(originalPlayers);
    }

    @Test
    void readAndWritePreserveUnknownTopLevelFields() throws Exception {
        String stored = "{\"roomCode\":\"A7K9Q2\",\"hostId\":\"" + HOST_ID
                + "\",\"maxPlayers\":6,\"players\":[],\"futureField\":{\"enabled\":true}}";
        when(values.get("room:A7K9Q2")).thenReturn(stored);

        RoomSnapshot snapshot = store.read("A7K9Q2");
        snapshot.root().put("maxPlayers", 8);
        store.write("A7K9Q2", snapshot.root());

        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(values).set(eq("room:A7K9Q2"), captor.capture());
        JsonNode written = objectMapper.readTree(captor.getValue());
        assertThat(written.path("maxPlayers").asInt()).isEqualTo(8);
        assertThat(written.path("futureField").path("enabled").asBoolean()).isTrue();
    }

    @Test
    void writeMapsSerializationFailureWithoutCallingRedis() {
        ObjectMapper failingMapper = mock(ObjectMapper.class);
        when(failingMapper.writeValueAsString(any(ObjectNode.class))).thenThrow(mock(JacksonException.class));
        UpdateMaxPlayersRoomStore failingStore = new UpdateMaxPlayersRoomStore(redis, failingMapper);
        ObjectNode root = objectMapper.createObjectNode();
        root.put("maxPlayers", 9);
        assertThatThrownBy(() -> failingStore.write("A7K9Q2", root)).isInstanceOf(RoomSerializationException.class);
        verify(values, never()).set(anyString(), anyString());
    }

    @Test
    void writeMapsRedisFailureToStorageUnavailable() {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("maxPlayers", 9);
        doThrow(new IllegalStateException("redis detail")).when(values).set(anyString(), anyString());
        assertThatThrownBy(() -> store.write("A7K9Q2", root)).isInstanceOf(RoomStorageUnavailableException.class);
    }

    private static String validRoomWithHostId(String hostId) {
        return roomJsonWithHostProperty("\"hostId\":\"" + hostId + "\"");
    }

    private static String roomJsonWithHostProperty(String hostProperty) {
        String prefix = "{\"roomCode\":\"A7K9Q2\",";
        String host = hostProperty == null ? "" : hostProperty + ",";
        return prefix + host + "\"maxPlayers\":6,\"players\":[]}";
    }
}
