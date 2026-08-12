package com.masoi.room;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RoomHealthController {

    @GetMapping("/api/rooms/test")
    public Map<String, String> testRoomRoute() {
        // Endpoint toi thieu de Gateway co the xac nhan da route duoc den Room Service.
        return Map.of(
                "service", "room-service",
                "status", "ok"
        );
    }
}
