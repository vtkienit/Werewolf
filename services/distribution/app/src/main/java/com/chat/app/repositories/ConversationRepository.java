package com.chat.app.repositories;

import com.chat.app.entities.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByUser1_IdAndUser2_Id(Long user1Id, Long user2Id);
}