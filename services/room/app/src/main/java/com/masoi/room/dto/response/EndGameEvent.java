package com.masoi.room.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public final class EndGameEvent {
    private final String gameId;
    private final String winningSide;
    private final List<PublicRoleSummary> roles;

    public EndGameEvent(String gameId) {
        this(gameId, null, null);
    }

    public EndGameEvent(String gameId, String winningSide, List<PublicRoleSummary> roles) {
        this.gameId = gameId;
        this.winningSide = winningSide;
        this.roles = roles == null ? null : List.copyOf(roles);
    }

    public String gameId() {
        return gameId;
    }

    public String getGameId() {
        return gameId;
    }

    public String winningSide() {
        return winningSide;
    }

    public String getWinningSide() {
        return winningSide;
    }

    public List<PublicRoleSummary> roles() {
        return roles;
    }

    public List<PublicRoleSummary> getRoles() {
        return roles;
    }

    @Override
    public String toString() {
        return "EndGameEvent[REDACTED]";
    }
}
