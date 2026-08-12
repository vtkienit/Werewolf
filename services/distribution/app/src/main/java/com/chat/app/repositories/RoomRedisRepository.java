package com.chat.app.repositories;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RoomRedisRepository {

    private static final String ROOM_KEY_PREFIX = "room:";

    private final StringRedisTemplate redisTemplate;

    public Optional<String> findRoomJsonByRoomCode(String roomCode) {
        // Đọc dữ liệu phòng từ Redis theo key room:{roomCode}.
        return Optional.ofNullable(redisTemplate.opsForValue().get(buildRoomKey(roomCode)));
    }

    public void saveRoomJson(String roomCode, String roomJson) {
        // Lưu dữ liệu phòng dạng JSON để các sprint sau parse thành Room model rõ ràng hơn.
        redisTemplate.opsForValue().set(buildRoomKey(roomCode), roomJson);
    }

    private String buildRoomKey(String roomCode) {
        // Gom logic tạo key vào một chỗ để tránh gõ sai prefix ở nhiều nơi.
        return ROOM_KEY_PREFIX + roomCode;
    }
}
