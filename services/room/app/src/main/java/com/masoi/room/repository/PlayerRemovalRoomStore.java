package com.masoi.room.repository;

import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.utils.RoomCodeFormat;

import java.util.Base64;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

@Repository
public class PlayerRemovalRoomStore {
    private static final String ROOM_KEY_PREFIX = "room:";
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public PlayerRemovalRoomStore(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    public RemovalResult remove(String roomCode, String playerId) {
        RoomCodeFormat.requireCanonical(roomCode);
        if (playerId == null || playerId.isBlank()) throw new IllegalArgumentException("playerId must be present");
        RoomSnapshot snapshot = read(roomCode);
        ArrayNode players = snapshot.root().withArray("players");
        for (int index = 0; index < players.size(); index++) {
            JsonNode player = players.get(index);
            if (playerId.equals(player.path("playerId").asString())) {
                players.remove(index);
                write(roomCode, snapshot.root());
                return new Removed(snapshot(snapshot.root()));
            }
        }
        return new AlreadyAbsent(snapshot);
    }

    private RoomSnapshot read(String roomCode) {
        String json;
        try {
            json = redis.opsForValue().get(ROOM_KEY_PREFIX + roomCode);
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
        if (json == null) throw new RoomNotFoundException();
        try {
            JsonNode root = objectMapper.readTree(json);
            if (!isValidRoom(root, roomCode)) throw new RoomSerializationException(null);
            return snapshot((ObjectNode) root);
        } catch (RoomSerializationException exception) {
            throw exception;
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        }
    }

    private void write(String roomCode, ObjectNode root) {
        String json;
        try {
            json = objectMapper.writeValueAsString(root);
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        }
        try {
            redis.opsForValue().set(ROOM_KEY_PREFIX + roomCode, json);
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    private static RoomSnapshot snapshot(ObjectNode root) {
        return new RoomSnapshot(root, root.get("hostId").asString(), root.get("maxPlayers").asInt(), root.get("players").size());
    }

    private static boolean isValidRoom(JsonNode root, String roomCode) {
        return root != null && root.isObject()
                && root.has("roomCode") && root.get("roomCode").isString()
                && roomCode.equals(root.get("roomCode").asString()) && RoomCodeFormat.isValid(roomCode)
                && root.has("hostId") && root.get("hostId").isString() && canonicalHostId(root.get("hostId").asString())
                && root.has("maxPlayers") && root.get("maxPlayers").isIntegralNumber() && root.get("maxPlayers").canConvertToInt()
                && root.has("players") && root.get("players").isArray();
    }

    private static boolean canonicalHostId(String hostId) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(hostId);
            return decoded.length == 16 && Base64.getUrlEncoder().withoutPadding().encodeToString(decoded).equals(hostId);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public sealed interface RemovalResult permits Removed, AlreadyAbsent {
        RoomSnapshot snapshot();
    }

    public record Removed(RoomSnapshot snapshot) implements RemovalResult {
    }

    public record AlreadyAbsent(RoomSnapshot snapshot) implements RemovalResult {
    }
}
