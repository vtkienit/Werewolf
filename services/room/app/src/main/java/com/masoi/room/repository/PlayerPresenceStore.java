package com.masoi.room.repository;

import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Repository
public class PlayerPresenceStore {
    private static final DefaultRedisScript<Long> CONNECT = new DefaultRedisScript<>(
            "redis.call('set', KEYS[1], ARGV[1]); redis.call('set', KEYS[2], ARGV[2]); return 1", Long.class);
    private static final DefaultRedisScript<Long> DELETE_IF_CURRENT = new DefaultRedisScript<>(
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", Long.class);
    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public PlayerPresenceStore(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis = redis;
        this.mapper = mapper;
    }

    public void connect(String roomCode, String playerId, String sessionId) {
        ObjectNode association = mapper.createObjectNode();
        association.put("roomCode", roomCode);
        association.put("playerId", playerId);
        try {
            String reverseValue = mapper.writeValueAsString(association);
            redis.execute(CONNECT, List.of(currentKey(roomCode, playerId), sessionKey(sessionId)), sessionId, reverseValue);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    public boolean connected(String roomCode, String playerId) {
        return redis.opsForValue().get(currentKey(roomCode, playerId)) != null;
    }

    public boolean isCurrentSession(String roomCode, String playerId, String sessionId) {
        if (!com.masoi.room.utils.RoomCodeFormat.isValid(roomCode) || playerId == null || playerId.isBlank() || sessionId == null || sessionId.isBlank())
            return false;
        try {
            return sessionId.equals(redis.opsForValue().get(currentKey(roomCode, playerId)));
        } catch (RuntimeException exception) {
            throw new com.masoi.room.exception.RoomStorageUnavailableException(exception);
        }
    }

    public SessionAssociation findAssociation(String sessionId) {
        String value = redis.opsForValue().get(sessionKey(sessionId));
        if (value == null) return null;
        try {
            var association = mapper.readTree(value);
            String roomCode = association.path("roomCode").asText();
            String playerId = association.path("playerId").asText();
            return roomCode.isBlank() || playerId.isBlank() ? null : new SessionAssociation(roomCode, playerId);
        } catch (Exception exception) {
            return null;
        }
    }

    public Association disconnect(String sessionId) {
        String value = redis.opsForValue().get(sessionKey(sessionId));
        if (value == null) return null;
        String roomCode;
        String playerId;
        try {
            var association = mapper.readTree(value);
            roomCode = association.path("roomCode").asText();
            playerId = association.path("playerId").asText();
        } catch (Exception exception) {
            redis.delete(sessionKey(sessionId));
            return null;
        }
        redis.delete(sessionKey(sessionId));
        boolean current = Long.valueOf(1L).equals(redis.execute(DELETE_IF_CURRENT, List.of(currentKey(roomCode, playerId)), sessionId));
        return new Association(roomCode, playerId, current);
    }

    public static String currentKey(String roomCode, String playerId) {
        return "presence:room:" + roomCode + ":player:" + playerId;
    }

    public static String sessionKey(String sessionId) {
        return "presence:session:" + sessionId;
    }

    public record Association(String roomCode, String playerId, boolean wasCurrent) {
    }

    public record SessionAssociation(String roomCode, String playerId) {
    }
}

