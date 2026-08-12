package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private UserResponse user1;
    private UserResponse user2;
    private LocalDateTime createdAt;
}