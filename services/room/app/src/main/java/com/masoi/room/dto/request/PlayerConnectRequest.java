package com.masoi.room.dto.request;

public record PlayerConnectRequest(String playerId, String playerToken, String hostId) {
    public PlayerConnectRequest(String playerId, String playerToken) {
        this(playerId, playerToken, null);
    }

    public static PlayerConnectRequest host(String hostId) {
        return new PlayerConnectRequest(null, null, hostId);
    }

    public boolean isHost() {
        return hostId != null;
    }
}

