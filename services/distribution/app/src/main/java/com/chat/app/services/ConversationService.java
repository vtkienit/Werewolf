package com.chat.app.services;

import com.chat.app.dtos.ConversationRequest;
import com.chat.app.dtos.ConversationResponse;
import com.chat.app.dtos.MessageResponse;
import com.chat.app.dtos.UserResponse;
import com.chat.app.entities.Conversation;
import com.chat.app.entities.Message;
import com.chat.app.entities.User;
import com.chat.app.exceptions.BaseException;
import com.chat.app.repositories.ConversationRepository;
import com.chat.app.repositories.MessageRepository;
import com.chat.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ConversationResponse createConversation(ConversationRequest request) {
        Long user1Id = request.getUser1Id();
        Long user2Id = request.getUser2Id();

        if (user1Id.equals(user2Id))
            throw new BaseException(
                    "Cannot create conversation with yourself",
                    HttpStatus.BAD_REQUEST
            );

        if (user1Id > user2Id) {
            Long temp = user1Id;
            user1Id = user2Id;
            user2Id = temp;
        }

        Conversation conversation = conversationRepository.findByUser1_IdAndUser2_Id(user1Id, user2Id)
                .orElse(null);

        if (conversation == null) {
            User user1 = userRepository.findById(user1Id)
                    .orElseThrow(() -> new BaseException("User 1 not found", HttpStatus.NOT_FOUND));

            User user2 = userRepository.findById(user2Id)
                    .orElseThrow(() -> new BaseException("User 2 not found", HttpStatus.NOT_FOUND));

            conversation = new Conversation();
            conversation.setUser1(user1);
            conversation.setUser2(user2);

            conversation = conversationRepository.save(conversation);
        }

        return new ConversationResponse(
                conversation.getId(),
                new UserResponse(
                        conversation.getUser1().getId(),
                        conversation.getUser1().getName(),
                        conversation.getUser1().getEmail(),
                        conversation.getUser1().getColor(),
                        conversation.getUser1().getRole()
                ),
                new UserResponse(
                        conversation.getUser2().getId(),
                        conversation.getUser2().getName(),
                        conversation.getUser2().getEmail(),
                        conversation.getUser2().getColor(),
                        conversation.getUser2().getRole()
                ),
                conversation.getCreatedAt()
        );
    }

    public List<MessageResponse> getMessages(Long conversationId, Long currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow();

        boolean isMember = conversation.getUser1().getId().equals(currentUserId)
                || conversation.getUser2().getId().equals(currentUserId);

        if (!isMember)
            throw new BaseException(
                    "You are not allowed to view this conversation",
                    HttpStatus.UNAUTHORIZED
            );

        List<Message> messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);

        return messages.stream()
                .map(message -> {
                    User sender = message.getSenderId().equals(message.getConversation().getUser1().getId())
                            ? message.getConversation().getUser1()
                            : message.getConversation().getUser2();

                    return new MessageResponse(
                            message.getId(),
                            conversationId,
                            message.getContent(),
                            message.getSenderId(),
                            message.getCreatedAt(),
                            new UserResponse(sender.getId(), sender.getName(), sender.getEmail(), sender.getColor(), sender.getRole())
                    );
                })
                .toList();
    }
}