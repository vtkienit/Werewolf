package com.masoi.room.service;

import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.*;
import com.masoi.room.utils.RoomCodeFormat;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
public class PrivateRoleSubscriptionAuthorizer {
    private final RoomRepository rooms;
    private final PlayerAuthStore auth;

    public PrivateRoleSubscriptionAuthorizer(RoomRepository rooms, PlayerAuthStore auth) {
        this.rooms = rooms;
        this.auth = auth;
    }

    public boolean authorize(String roomCode, String playerId, String token) {
        if (!RoomCodeFormat.isValid(roomCode) || playerId == null || playerId.isBlank() || token == null || token.isBlank())
            return false;
        RoomSnapshot room = rooms.read(roomCode);
        if (room == null) return false;
        for (JsonNode player : room.root().withArray("players"))
            if (playerId.equals(player.path("playerId").asString())) return auth.matches(roomCode, playerId, token);
        return false;
    }
}
