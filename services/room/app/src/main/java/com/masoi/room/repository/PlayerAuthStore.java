package com.masoi.room.repository;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import com.masoi.room.exception.RoomStorageUnavailableException;

@Repository
public class PlayerAuthStore {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final StringRedisTemplate redis;

    public PlayerAuthStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public String create(String roomCode, String playerId) {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        try {
            if (!Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(key(roomCode, playerId), digest(token)))) {
                throw new RoomStorageUnavailableException(null);
            }
            return token;
        } catch (RoomStorageUnavailableException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    public boolean matches(String roomCode, String playerId, String token) {
        if (token == null || token.isBlank()) return false;
        try {
            String stored = redis.opsForValue().get(key(roomCode, playerId));
            return stored != null && MessageDigest.isEqual(stored.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                    digest(token).getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    public void delete(String roomCode, String playerId) {
        try {
            redis.delete(key(roomCode, playerId));
        } catch (RuntimeException ignored) {
        }
    }

    public void deleteExact(String roomCode, String playerId) {
        try {
            redis.delete(key(roomCode, playerId));
        } catch (RuntimeException exception) {
            throw new RoomStorageUnavailableException(exception);
        }
    }

    public static String digest(String token) {
        try {
            return Base64.getUrlEncoder().withoutPadding().encodeToString(MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    public static String key(String roomCode, String playerId) {
        return "player:auth:" + roomCode + ":" + playerId;
    }
}

