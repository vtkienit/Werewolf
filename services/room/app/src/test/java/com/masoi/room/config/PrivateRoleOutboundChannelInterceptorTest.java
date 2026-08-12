package com.masoi.room.config;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.masoi.room.repository.PlayerPresenceStore;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.*;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.simp.stomp.*;

class PrivateRoleOutboundChannelInterceptorTest {
    PlayerPresenceStore presence = mock(PlayerPresenceStore.class);
    PrivateRoleOutboundChannelInterceptor i = new PrivateRoleOutboundChannelInterceptor(presence);

    @Test
    void currentSessionReceivesPrivateMessage() {
        when(presence.isCurrentSession("A7K9Q2", "p1", "s1")).thenReturn(true);
        assertThat(i.preSend(msg("/broadcast/distribution/rooms/A7K9Q2/start-game/p1", "s1"), null)).isNotNull();
    }

    @Test
    void staleAbsentWrongAndFailureAreSuppressed() {
        assertThat(i.preSend(msg("/broadcast/distribution/rooms/A7K9Q2/start-game/p1", "stale"), null)).isNull();
        when(presence.isCurrentSession("A7K9Q2", "p1", "boom")).thenThrow(new IllegalStateException());
        assertThat(i.preSend(msg("/broadcast/distribution/rooms/A7K9Q2/start-game/p1", "boom"), null)).isNull();
    }

    @Test
    void publicAndEndGameMessagesAreUnaffected() {
        assertThat(i.preSend(msg("/broadcast/rooms/A7K9Q2/players", "stale"), null)).isNotNull();
        assertThat(i.preSend(msg("/broadcast/rooms/A7K9Q2/end-game", "stale"), null)).isNotNull();
        verifyNoInteractions(presence);
    }

    private Message<byte[]> msg(String d, String session) {
        var a = StompHeaderAccessor.create(StompCommand.MESSAGE);
        a.setDestination(d);
        a.setSessionId(session);
        return MessageBuilder.createMessage(new byte[0], a.getMessageHeaders());
    }
}
