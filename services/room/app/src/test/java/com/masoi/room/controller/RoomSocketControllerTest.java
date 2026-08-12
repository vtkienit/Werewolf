package com.masoi.room.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.exception.SocketAuthenticationException;
import com.masoi.room.service.GameEventService;
import com.masoi.room.service.LobbyService;
import com.masoi.room.utils.PlayerConnectRequestParser;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

class RoomSocketControllerTest {
    private final LobbyService lobby = mock(LobbyService.class);
    private final PlayerConnectRequestParser parser = mock(PlayerConnectRequestParser.class);
    private final GameEventService gameEvents = mock(GameEventService.class);
    private final MessageChannel outbound = mock(MessageChannel.class);
    private final RoomSocketController controller = new RoomSocketController(lobby, parser, gameEvents, outbound);

    @Test
    void successfulConnectReplaysAfterLobbyCompletion() {
        PlayerConnectRequest request = new PlayerConnectRequest("p1", "token");
        when(parser.parse("ABC234", "body")).thenReturn(request);
        controller.connect("ABC234", "body", headers());
        var order = inOrder(lobby, gameEvents);
        order.verify(lobby).connect("ABC234", request, "session-1");
        order.verify(gameEvents).replayAfterPlayerConnect("ABC234", "p1");
        verifyNoInteractions(outbound);
    }

    @Test
    void authenticationFailureDoesNotReplayAndKeepsExactTerminalBody() {
        when(parser.parse("ABC234", "body")).thenReturn(new PlayerConnectRequest("p1", "token"));
        doThrow(new SocketAuthenticationException()).when(lobby).connect(anyString(), any(), anyString());
        controller.connect("ABC234", "body", headers());
        verifyNoInteractions(gameEvents);
        ArgumentCaptor<Message<?>> message = ArgumentCaptor.forClass(Message.class);
        verify(outbound).send(message.capture());
        assertThat(new String((byte[]) message.getValue().getPayload(), StandardCharsets.UTF_8))
                .isEqualTo("{\"code\":\"SOCKET_AUTH_FAILED\"}");
    }

    @Test
    void replayFailureIsNonTerminalAfterSuccessfulLobbyConnect() {
        PlayerConnectRequest request = new PlayerConnectRequest("p1", "token");
        when(parser.parse("ABC234", "body")).thenReturn(request);
        doThrow(new IllegalStateException("role data")).when(gameEvents).replayAfterPlayerConnect("ABC234", "p1");
        controller.connect("ABC234", "body", headers());
        verify(lobby).connect("ABC234", request, "session-1");
        verifyNoInteractions(outbound);
    }

    private static StompHeaderAccessor headers() {
        StompHeaderAccessor headers = StompHeaderAccessor.create(StompCommand.SEND);
        headers.setSessionId("session-1");
        return headers;
    }
}
