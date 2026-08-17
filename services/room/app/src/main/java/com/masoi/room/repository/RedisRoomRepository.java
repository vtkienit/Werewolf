package com.masoi.room.repository;

import com.masoi.room.repository.RoomRepository;
import com.masoi.room.model.SaveRoomResult;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import com.masoi.room.model.Room;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.utils.RoomCodeFormat;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ObjectNode;

import java.util.Base64;

@Repository
public class RedisRoomRepository implements RoomRepository {
    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public RedisRoomRepository(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    @Override
    public SaveRoomResult saveIfAbsent(Room room) {
        try {
            String json = objectMapper.writeValueAsString(room);
            Boolean saved = redis.opsForValue().setIfAbsent("room:" + room.roomCode(), json);
            if (saved == null) {
                throw new RoomStorageUnavailableException(null);
            }
            return saved ? SaveRoomResult.SAVED : SaveRoomResult.COLLISION;
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        } catch (RoomStorageUnavailableException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    @Override
    public RoomSnapshot read(String roomCode) {
        try {
            String json = redis.opsForValue().get("room:" + roomCode);
            if (json == null) return null;
            JsonNode node = objectMapper.readTree(json);
            if (!valid(node, roomCode)) throw new RoomSerializationException(null);
            ObjectNode root = (ObjectNode) node;
            return new RoomSnapshot(root, root.get("hostId").asString(), root.get("maxPlayers").asInt(), root.get("players").size());
        } catch (RoomSerializationException exception) {
            throw exception;
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    @Override
    public void write(String roomCode, ObjectNode root) {
        try {
            redis.opsForValue().set("room:" + roomCode, objectMapper.writeValueAsString(root));
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    private static boolean valid(JsonNode root, String roomCode) {
        if (root == null || !root.isObject() || !root.has("roomCode")
                || !root.get("roomCode").isString() || !roomCode.equals(root.get("roomCode").asString())
                || !RoomCodeFormat.isValid(roomCode) || !root.has("hostId") || !root.get("hostId").isString()
                || !canonicalHostId(root.get("hostId").asString()) || !root.has("maxPlayers")
                || !root.get("maxPlayers").isIntegralNumber() || !root.get("maxPlayers").canConvertToInt()
                || !root.has("players") || !root.get("players").isArray()) return false;
        return true;
    }

    private static boolean canonicalHostId(String hostId) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(hostId);
            return decoded.length == 16 && Base64.getUrlEncoder().withoutPadding().encodeToString(decoded).equals(hostId);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
