package com.masoi.room.controller;

import com.masoi.room.service.LobbyService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketDisconnectListener {
    private final LobbyService lobby;

    public WebSocketDisconnectListener(LobbyService lobby) {
        this.lobby = lobby;
    }

    @EventListener
    public void disconnect(SessionDisconnectEvent event) {
        if (event.getSessionId() != null) lobby.disconnect(event.getSessionId());
    }
}

