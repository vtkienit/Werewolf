package com.masoi.room.controller;

import com.masoi.room.service.LobbyService;
import com.masoi.room.service.GameEventService;
import com.masoi.room.utils.PlayerConnectRequestParser;
import com.masoi.room.exception.SocketAuthenticationException;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Controller;

@Controller
public class RoomSocketController {
    private final LobbyService lobby;
    private final PlayerConnectRequestParser parser;
    private final GameEventService gameEvents;
    private final MessageChannel clientOutboundChannel;

    public RoomSocketController(LobbyService lobby, PlayerConnectRequestParser parser, GameEventService gameEvents, @Qualifier("clientOutboundChannel") MessageChannel clientOutboundChannel) {
        this.lobby = lobby;
        this.parser = parser;
        this.gameEvents = gameEvents;
        this.clientOutboundChannel = clientOutboundChannel;
    }

    @MessageMapping("/rooms/{roomCode}/connect")
    public void connect(@DestinationVariable String roomCode, String body, SimpMessageHeaderAccessor headers) {
        String sessionId = headers.getSessionId();
        if (sessionId == null) throw new SocketAuthenticationException();
        try {
            var request = parser.parse(roomCode, body);
            if (request.isHost()) lobby.connectHost(roomCode, request.hostId());
            else {
                lobby.connect(roomCode, request, sessionId);
                try {
                    gameEvents.replayAfterPlayerConnect(roomCode, request.playerId());
                } catch (RuntimeException ignored) {
                }
            }
        } catch (SocketAuthenticationException exception) {
            sendAuthenticationError(sessionId);
        }
    }

    private void sendAuthenticationError(String sessionId) {
        StompHeaderAccessor headers = StompHeaderAccessor.create(StompCommand.ERROR);
        headers.setSessionId(sessionId);
        headers.setMessage("SOCKET_AUTH_FAILED");
        headers.setLeaveMutable(true);
        clientOutboundChannel.send(MessageBuilder.createMessage("{\"code\":\"SOCKET_AUTH_FAILED\"}".getBytes(StandardCharsets.UTF_8), headers.getMessageHeaders()));
    }
}

