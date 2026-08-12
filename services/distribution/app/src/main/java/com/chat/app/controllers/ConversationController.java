package com.chat.app.controllers;

import com.chat.app.dtos.ConversationRequest;
import com.chat.app.dtos.ConversationResponse;
import com.chat.app.dtos.MessageResponse;
import com.chat.app.services.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ConversationResponse createConversation(@RequestBody ConversationRequest request) {
        return conversationService.createConversation(request);
    }

    @GetMapping("/{conversationId}/messages")
    public List<MessageResponse> getMessages(@PathVariable Long conversationId, Authentication authentication) {
        Long currentUserId = (Long) authentication.getPrincipal();
        return conversationService.getMessages(conversationId, currentUserId);
    }
}