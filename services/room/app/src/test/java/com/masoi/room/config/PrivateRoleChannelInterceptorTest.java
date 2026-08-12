package com.masoi.room.config;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.masoi.room.service.PrivateRoleSubscriptionAuthorizer;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.*;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;

class PrivateRoleChannelInterceptorTest {
    PrivateRoleSubscriptionAuthorizer auth = mock(PrivateRoleSubscriptionAuthorizer.class);
    PrivateRoleChannelInterceptor i = new PrivateRoleChannelInterceptor(auth);

    @Test
    void allowsValidPrivateSubscribe() {
        when(auth.authorize("A7K9Q2", "p1", "token")).thenReturn(true);
        var message = msg(StompCommand.SUBSCRIBE, "/broadcast/distribution/rooms/A7K9Q2/start-game/p1", List.of("token"));
        assertThat(i.preSend(message, null)).isNotNull();
        assertThat(StompHeaderAccessor.wrap(message).getNativeHeader("X-Player-Token")).isNull();
    }

    @Test
    void rejectsInvalidPrivateSubscriptions() {
        for (var d : new String[]{"/broadcast/distribution/rooms/A7K9Q2/start-game/p1/", "/broadcast/distribution/rooms/a7k9q2/start-game/p1", "/broadcast/distribution/rooms/A7K9Q2/start-game/p1/extra", "/broadcast/distribution/rooms/A7K9Q2/start-game/%2e%2e"})
            assertThatThrownBy(() -> i.preSend(msg(StompCommand.SUBSCRIBE, d, List.of("token")), null)).isInstanceOf(AccessDeniedException.class).hasMessage("Private destination access denied");
        assertThatThrownBy(() -> i.preSend(msg(StompCommand.SUBSCRIBE, "/broadcast/distribution/rooms/A7K9Q2/start-game/p1", List.of()), null)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> i.preSend(msg(StompCommand.SUBSCRIBE, "/broadcast/distribution/rooms/A7K9Q2/start-game/p1", List.of("a", "b")), null)).isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void allowsPublicSubscribeAndConnectSend() {
        assertThat(i.preSend(msg(StompCommand.SUBSCRIBE, "/broadcast/rooms/A7K9Q2/players", List.of()), null)).isNotNull();
        assertThat(i.preSend(msg(StompCommand.SEND, "/app/rooms/A7K9Q2/connect", List.of()), null)).isNotNull();
    }

    @Test
    void deniesClientBroadcastSend() {
        assertThatThrownBy(() -> i.preSend(msg(StompCommand.SEND, "/broadcast/distribution/rooms/A7K9Q2/start-game/p1", List.of()), null)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> i.preSend(msg(StompCommand.SEND, "/broadcast/rooms/A7K9Q2/end-game", List.of()), null)).isInstanceOf(AccessDeniedException.class);
    }

    private Message<byte[]> msg(StompCommand c, String d, List<String> tokens) {
        var a = StompHeaderAccessor.create(c);
        a.setDestination(d);
        for (String t : tokens) a.addNativeHeader("X-Player-Token", t);
        a.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], a.getMessageHeaders());
    }
}
