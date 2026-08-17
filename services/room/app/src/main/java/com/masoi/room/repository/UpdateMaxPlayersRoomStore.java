package com.masoi.room.repository;

import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.utils.RoomCodeFormat;
import com.masoi.room.model.RoomSnapshot;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.Base64;

@Repository
public class UpdateMaxPlayersRoomStore {
    private static final String ROOM_KEY_PREFIX = "room:";
    private static final String FIELD_ROOM_CODE = "roomCode";
    private static final String FIELD_HOST_ID = "hostId";
    private static final String FIELD_MAX_PLAYERS = "maxPlayers";
    private static final String FIELD_PLAYERS = "players";

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public UpdateMaxPlayersRoomStore(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    public RoomSnapshot read(String roomCode) {
        String json;
        try {
            json = redis.opsForValue().get(ROOM_KEY_PREFIX + roomCode);
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
        if (json == null) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            if (!isValidRoom(root, roomCode)) {
                throw new RoomSerializationException(null);
            }
            ObjectNode objectRoot = (ObjectNode) root;
            String hostId = root.get(FIELD_HOST_ID).asString();
            int currentMaxPlayers = root.get(FIELD_MAX_PLAYERS).asInt();
            int playerCount = root.get(FIELD_PLAYERS).size();
            return new RoomSnapshot(objectRoot, hostId, currentMaxPlayers, playerCount);
        } catch (JacksonException exception) {
            throw new RoomSerializationException(exception);
        }
    }

    public void write(String roomCode, ObjectNode root) {
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

    private static boolean isValidRoom(JsonNode root, String requestedRoomCode) {
        return root != null && root.isObject()
                && root.has(FIELD_ROOM_CODE) && root.get(FIELD_ROOM_CODE).isString()
                && RoomCodeFormat.isValid(root.get(FIELD_ROOM_CODE).asString())
                && requestedRoomCode.equals(root.get(FIELD_ROOM_CODE).asString())
                && root.has(FIELD_HOST_ID) && root.get(FIELD_HOST_ID).isString()
                && isCanonicalHostId(root.get(FIELD_HOST_ID).asString())
                && root.has(FIELD_MAX_PLAYERS) && root.get(FIELD_MAX_PLAYERS).isIntegralNumber()
                && root.get(FIELD_MAX_PLAYERS).canConvertToInt()
                && root.has(FIELD_PLAYERS) && root.get(FIELD_PLAYERS).isArray();
    }

    private static boolean isCanonicalHostId(String hostId) {
        if (hostId.length() != 22) {
            return false;
        }
        for (int index = 0; index < hostId.length(); index++) {
            char character = hostId.charAt(index);
            if (!(character >= 'A' && character <= 'Z')
                    && !(character >= 'a' && character <= 'z')
                    && !(character >= '0' && character <= '9')
                    && character != '-'
                    && character != '_') {
                return false;
            }
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(hostId);
            return decoded.length == 16
                    && Base64.getUrlEncoder().withoutPadding().encodeToString(decoded).equals(hostId);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
