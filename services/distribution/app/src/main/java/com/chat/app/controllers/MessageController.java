package com.chat.app.controllers;

import com.chat.app.dtos.MessageRequest;
import com.chat.app.dtos.MessageResponse;
import com.chat.app.exceptions.BaseException;
import com.chat.app.services.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/conversations/{conversationId}/messages")
    public void sendMessage(@DestinationVariable Long conversationId, Authentication authentication, MessageRequest request) {
        if (authentication == null)
            throw new BaseException("Unauthenticated user", HttpStatus.UNAUTHORIZED);

        Long senderId = (Long) authentication.getPrincipal();

        MessageResponse saved = messageService.save(
                conversationId,
                senderId,
                request.getContent()
        );

        // Broadcast for opening conversation
        String conversationDestination =
                "/broadcast/conversations/" + conversationId + "/messages";

        messagingTemplate.convertAndSend(conversationDestination, saved);

        // Broadcast notification for receiver
        Long receiverId = messageService.getReceiverId(conversationId, senderId);

        String notificationDestination =
                "/broadcast/users/" + receiverId + "/notifications";

        messagingTemplate.convertAndSend(notificationDestination, saved);
    }
}