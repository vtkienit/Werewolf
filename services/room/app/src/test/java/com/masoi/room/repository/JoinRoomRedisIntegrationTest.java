package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.exception.JoinRoomSerializationException;
import com.masoi.room.exception.RoomFullException;
import com.masoi.room.service.RoomService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.HashSet;
import java.util.Set;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest
class JoinRoomRedisIntegrationTest {
    private static final String CODE = "A7K9Q2";
    private static final String KEY = "room:" + CODE;
    private static final String LOCK = "lock:room:" + CODE;
    @Autowired
    StringRedisTemplate redis;
    @Autowired
    RoomService service;
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
    void appendsAtExactKeyAndPreservesCompatibleFields() throws Exception {
        ObjectNode room = room(6);
        room.putObject("futureField").put("enabled", true);
        room.withArray("players").addObject().put("playerId", "existing").put("playerName", "Old").putNull("roleId").put("future", 1);
        redis.opsForValue().set(KEY, mapper.writeValueAsString(room));
        var result = service.joinRoom(CODE, new JoinRoomRequest("Alice"));
        joinedPlayerIds.add(result.playerId());
        JsonNode saved = mapper.readTree(redis.opsForValue().get(KEY));
        assertThat(result.playerName()).isEqualTo("Alice");
        assertThat(saved.path("roomCode").asString()).isEqualTo(CODE);
        assertThat(saved.path("hostId").asString()).isEqualTo("mP5cYgYNGxa2-WPNnTMR1Q");
        assertThat(saved.path("maxPlayers").asInt()).isEqualTo(6);
        assertThat(saved.path("futureField").path("enabled").asBoolean()).isTrue();
        assertThat(saved.path("players").size()).isEqualTo(2);
        assertThat(saved.path("players").get(0).path("future").asInt()).isEqualTo(1);
        assertThat(saved.path("players").get(1).path("roleId").isNull()).isTrue();
        assertThat(redis.hasKey("rooms:" + CODE)).isFalse();
    }

    @Test
    void rejectsMalformedRoomWithoutWriting() {
        redis.opsForValue().set(KEY, "{");
        assertThatThrownBy(() -> service.joinRoom(CODE, new JoinRoomRequest("Alice"))).isInstanceOf(JoinRoomSerializationException.class);
    }

    @Test
    void duplicateNamesAreIndependentAndFullDoesNotRewriteRoom() throws Exception {
        ObjectNode duplicate = room(6);
        duplicate.withArray("players").addObject().put("playerId", "1").put("playerName", "Alice").putNull("roleId");
        String original = mapper.writeValueAsString(duplicate);
        redis.opsForValue().set(KEY, original);
        var duplicateJoin = service.joinRoom(CODE, new JoinRoomRequest(" alice "));
        joinedPlayerIds.add(duplicateJoin.playerId());
        assertThat(mapper.readTree(redis.opsForValue().get(KEY)).path("players")).hasSize(2);

        ObjectNode full = room(6);
        for (int i = 0; i < 6; i++)
            full.withArray("players").addObject().put("playerId", "p" + i).put("playerName", "P" + i).putNull("roleId");
        original = mapper.writeValueAsString(full);
        redis.opsForValue().set(KEY, original);
        assertThatThrownBy(() -> service.joinRoom(CODE, new JoinRoomRequest("Alice"))).isInstanceOf(RoomFullException.class);
        assertThat(redis.opsForValue().get(KEY)).isEqualTo(original);
    }

    private ObjectNode room(int maxPlayers) {
        ObjectNode root = mapper.createObjectNode();
        root.put("roomCode", CODE);
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", maxPlayers);
        root.putArray("players");
        return root;
    }
}
