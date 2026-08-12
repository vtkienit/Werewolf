package com.chat.app.services;

import com.chat.app.exceptions.BaseException;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DistributionRoomStore {
    private static final Logger LOG = LoggerFactory.getLogger(DistributionRoomStore.class);
    private static final DefaultRedisScript<Long> RELEASE = new DefaultRedisScript<>("if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", Long.class);
    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public DistributionRoomStore(StringRedisTemplate redis, ObjectMapper mapper) {
        this.redis = redis;
        this.mapper = mapper;
    }

    public <T> T locked(String roomCode, Function<ObjectNode, T> operation) {
        if (roomCode == null || !roomCode.matches("[A-Z2-9]{6}"))
            throw new BaseException("Invalid room code", HttpStatus.BAD_REQUEST);
        String owner = UUID.randomUUID().toString(), key = "lock:room:" + roomCode;
        boolean acquired = false;
        long deadline = System.nanoTime() + Duration.ofSeconds(2).toNanos();
        try {
            while (!(acquired = Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(key, owner, Duration.ofSeconds(10))))) {
                if (System.nanoTime() >= deadline) throw new BaseException("Room is busy", HttpStatus.CONFLICT);
                try {
                    Thread.sleep(50);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    throw new BaseException("Room is busy", HttpStatus.CONFLICT);
                }
            }
            String json = redis.opsForValue().get("room:" + roomCode);
            if (json == null) throw new BaseException("Room not found", HttpStatus.NOT_FOUND);
            ObjectNode room = (ObjectNode) mapper.readTree(json);
            T result = operation.apply(room);
            redis.opsForValue().set("room:" + roomCode, mapper.writeValueAsString(room));
            return result;
        } catch (BaseException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BaseException("Room storage unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        } finally {
            if (acquired) try {
                redis.execute(RELEASE, List.of(key), owner);
            } catch (RuntimeException exception) {
                LOG.error("Room lock release failed for room {}", roomCode);
            }
        }
    }
}
