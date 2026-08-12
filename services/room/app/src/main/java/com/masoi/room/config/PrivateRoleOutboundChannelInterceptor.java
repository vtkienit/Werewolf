package com.masoi.room.config;

import com.masoi.room.repository.PlayerPresenceStore;

import java.util.regex.*;

import org.springframework.messaging.*;
import org.springframework.messaging.simp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

@Component
public class PrivateRoleOutboundChannelInterceptor implements ChannelInterceptor {
    private static final String PREFIX = "/broadcast/distribution/rooms/";
    private static final Pattern PRIVATE = Pattern.compile("^/broadcast/distribution/rooms/([A-Z2-9]{6})/start-game/([^/%]+)$");
    private final PlayerPresenceStore presence;

    public PrivateRoleOutboundChannelInterceptor(PlayerPresenceStore presence) {
        this.presence = presence;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        var headers = message.getHeaders();
        String destination = SimpMessageHeaderAccessor.getDestination(headers);
        if (SimpMessageHeaderAccessor.getMessageType(headers) != SimpMessageType.MESSAGE || destination == null || !destination.startsWith(PREFIX))
            return message;
        Matcher match = PRIVATE.matcher(destination);
        String sessionId = SimpMessageHeaderAccessor.getSessionId(headers);
        if (!match.matches() || sessionId == null) return null;
        try {
            return presence.isCurrentSession(match.group(1), match.group(2), sessionId) ? message : null;
        } catch (RuntimeException exception) {
            return null;
        }
    }
}
