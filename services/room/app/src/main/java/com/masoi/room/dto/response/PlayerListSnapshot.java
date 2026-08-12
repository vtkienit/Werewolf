package com.masoi.room.dto.response;

import java.util.List;

public record PlayerListSnapshot(String roomCode, String status, int currentPlayers, int maxPlayers,
                                 List<PublicPlayer> players,
                                 List<PublicRoleSummary> activeRoles, PublicCompletedGameSummary lastCompletedGame) {
    public PlayerListSnapshot {
        players = List.copyOf(players);
        activeRoles = List.copyOf(activeRoles);
    }
}

