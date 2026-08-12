package com.chat.app.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConversationRequest {
    private Long user1Id;
    private Long user2Id;
}