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
public class PlayGameResponse {

    private String roomCode;

    private int numberPlayers;

    private String gameSessionId;

    private List<HostAssignmentResponse> assignments;
}
