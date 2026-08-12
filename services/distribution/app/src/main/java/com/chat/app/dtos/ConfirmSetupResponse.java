package com.chat.app.dtos;

import java.util.List;

public record ConfirmSetupResponse(String roomCode, List<RoleQuantityRequest> activeRoles) {
    public ConfirmSetupResponse {
        activeRoles = List.copyOf(activeRoles);
    }
}
