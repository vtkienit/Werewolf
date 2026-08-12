package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostAssignmentResponse {
    private String playerId;
    private String playerName;
    private String roleId;
    private String roleName;
}
