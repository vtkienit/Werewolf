package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EndGameRequest {

    private String hostId;

    private String winningSide;

    public EndGameRequest(String hostId) {
        this(hostId, null);
    }
}
