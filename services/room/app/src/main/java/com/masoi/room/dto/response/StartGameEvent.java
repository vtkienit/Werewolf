package com.masoi.room.dto.response;

public final class StartGameEvent {
    private final String gameId;
    private final String playerName;
    private final com.masoi.room.model.RoleId roleId;

    public StartGameEvent(String gameId, String playerName, com.masoi.room.model.RoleId roleId) {
        this.gameId = gameId;
        this.playerName = playerName;
        this.roleId = roleId;
    }

    public String gameId() {
        return gameId;
    }

    public String getGameId() {
        return gameId;
    }

    public String playerName() {
        return playerName;
    }

    public String getPlayerName() {
        return playerName;
    }

    public com.masoi.room.model.RoleId roleId() {
        return roleId;
    }

    public com.masoi.room.model.RoleId getRoleId() {
        return roleId;
    }

    @Override
    public String toString() {
        return "StartGameEvent[REDACTED]";
    }
}
