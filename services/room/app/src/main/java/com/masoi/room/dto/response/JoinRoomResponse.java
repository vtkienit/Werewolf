package com.masoi.room.dto.response;

public record JoinRoomResponse(String playerId, String playerName, String playerToken) {
    public JoinRoomResponse(String playerId, String playerName) {
        this(playerId, playerName, null);
    }
}
