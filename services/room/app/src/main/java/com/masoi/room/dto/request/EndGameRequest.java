package com.masoi.room.dto.request;

public final class EndGameRequest {
    private final String gameId;

    public EndGameRequest(String gameId) {
        this.gameId = gameId;
    }

    public String gameId() {
        return gameId;
    }

    public String getGameId() {
        return gameId;
    }

    @Override
    public String toString() {
        return "EndGameRequest[REDACTED]";
    }
}
