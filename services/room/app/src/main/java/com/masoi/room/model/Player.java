package com.masoi.room.model;

public record Player(String playerId, String playerName, String roleId, boolean ready) {
    public Player(String playerId, String playerName, String roleId) {
        this(playerId, playerName, roleId, false);
    }
}
