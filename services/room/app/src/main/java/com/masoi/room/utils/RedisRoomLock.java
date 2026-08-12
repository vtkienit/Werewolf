package com.masoi.room.utils;

import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.LockOwnerTokenGenerator;

import com.masoi.room.config.RoomLockProperties;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

@Component
public class RedisRoomLock implements RoomLock {
    private static final Logger LOGGER = LoggerFactory.getLogger(RedisRoomLock.class);
    private static final String LOCK_KEY_PREFIX = "lock:room:";
    private static final RedisScript<Long> RELEASE_SCRIPT = new DefaultRedisScript<>(
            "if redis.call(\"get\", KEYS[1]) == ARGV[1] then return redis.call(\"del\", KEYS[1]) else return 0 end",
            Long.class);

    private final StringRedisTemplate redis;
    private final LockOwnerTokenGenerator tokenGenerator;
    private final RoomLockProperties properties;

    public RedisRoomLock(StringRedisTemplate redis, LockOwnerTokenGenerator tokenGenerator, RoomLockProperties properties) {
        this.redis = redis;
        this.tokenGenerator = tokenGenerator;
        this.properties = properties;
    }

    @Override
    public String acquireOrThrow(String roomCode) {
        String lockKey = LOCK_KEY_PREFIX + roomCode;
        String ownerToken = tokenGenerator.generate();
        long deadlineNanos = System.nanoTime() + properties.acquisitionTimeout().toNanos();
        while (true) {
            Boolean acquired;
            try {
                acquired = redis.opsForValue().setIfAbsent(lockKey, ownerToken, properties.leaseDuration());
            } catch (RuntimeException exception) {
                throw new RoomStorageUnavailableException(exception);
            }
            if (Boolean.TRUE.equals(acquired)) {
                return ownerToken;
            }
            if (acquired == null) {
                throw new RoomStorageUnavailableException(null);
            }
            long remainingNanos = deadlineNanos - System.nanoTime();
            if (remainingNanos <= 0) {
                throw new RoomUpdateBusyException();
            }
            long sleepNanos = Math.min(properties.retryInterval().toNanos(), remainingNanos);
            try {
                Thread.sleep(sleepNanos / 1_000_000L, (int) (sleepNanos % 1_000_000L));
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new RoomUpdateBusyException(exception);
            }
        }
    }

    @Override
    public void release(String roomCode, String ownerToken) {
        try {
            redis.execute(RELEASE_SCRIPT, List.of(LOCK_KEY_PREFIX + roomCode), ownerToken);
        } catch (RuntimeException exception) {
            LOGGER.error("Room lock release failed");
        }
    }
}
