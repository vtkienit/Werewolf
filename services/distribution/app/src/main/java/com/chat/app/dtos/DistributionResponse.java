package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributionResponse {

    private String roomCode;

    private String hostId;

    private int numberPlayers;

    private List<DistributionPlayerRequest> players;
}