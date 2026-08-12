package com.masoi.room.dto.response;

import java.util.List;

public record PublicCompletedGameSummary(String winningSide, List<PublicRoleSummary> roles) {
    public PublicCompletedGameSummary {
        roles = List.copyOf(roles);
    }
}
