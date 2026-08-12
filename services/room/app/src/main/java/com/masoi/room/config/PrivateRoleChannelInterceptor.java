package com.masoi.room.config;

import com.masoi.room.service.PrivateRoleSubscriptionAuthorizer;

import java.util.List;
import java.util.regex.*;

import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class PrivateRoleChannelInterceptor implements ChannelInterceptor {
    private static final Pattern PRIVATE = Pattern.compile("^/broadcast/distribution/rooms/([A-Z2-9]{6})/start-game/([^/%]+)$"), END = Pattern.compile("^/broadcast/rooms/[A-Z2-9]{6}/end-game$");
    private static final String PREFIX = "/broadcast/distribution/rooms/", DENIED = "Private destination access denied";
    private final PrivateRoleSubscriptionAuthorizer authorizer;

    public PrivateRoleChannelInterceptor(PrivateRoleSubscriptionAuthorizer authorizer) {
        this.authorizer = authorizer;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = org.springframework.messaging.support.MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();
        String destination = accessor.getDestination();
        if (command == StompCommand.SUBSCRIBE) {
            if (destination == null) throw denied();
            if (!destination.startsWith(PREFIX)) return message;
            Matcher match = PRIVATE.matcher(destination);
            if (!match.matches()) throw denied();
            List<String> tokens = accessor.getNativeHeader("X-Player-Token");
            if (tokens == null || tokens.size() != 1 || tokens.getFirst() == null || tokens.getFirst().isBlank() || !authorizer.authorize(match.group(1), match.group(2), tokens.getFirst()))
                throw denied();
            accessor.removeNativeHeader("X-Player-Token");
            return message;
        }
        if (command == StompCommand.SEND && destination != null && (destination.startsWith(PREFIX) || END.matcher(destination).matches()))
            throw denied();
        return message;
    }

    private static AccessDeniedException denied() {
        return new AccessDeniedException(DENIED);
    }
}
