package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributionPlayerRequest {

    private String playerId;

    private String playerName;

    private String roleId;
}