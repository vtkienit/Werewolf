package com.chat.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    Long conversationId;
    private String content;
    private Long senderId;
    private LocalDateTime createdAt;
    private UserResponse user;
}