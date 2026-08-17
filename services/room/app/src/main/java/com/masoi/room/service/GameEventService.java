package com.masoi.room.service;

import com.masoi.room.dto.request.*;
import com.masoi.room.dto.response.*;
import com.masoi.room.exception.*;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.utils.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
public class GameEventService {
    private final RoomRepository rooms;
    private final RoomLock lock;
    private final GameEventLifecycleRegistry lifecycle;
    private final SimpMessagingTemplate messaging;
    private final LobbyService lobby;

    public GameEventService(RoomRepository rooms, RoomLock lock, GameEventLifecycleRegistry lifecycle, SimpMessagingTemplate messaging, LobbyService lobby) {
        this.rooms = rooms;
        this.lock = lock;
        this.lifecycle = lifecycle;
        this.messaging = messaging;
        this.lobby = lobby;
    }

    public void start(String roomCode, String playerId, StartGameRequest request) {
        RoomCodeFormat.requireCanonical(roomCode);
        if (playerId == null || playerId.isBlank()) throw new PlayerNotFoundException();
        String owner = null;
        try {
            owner = lock.acquireOrThrow(roomCode);
            RoomSnapshot room = requireRoom(roomCode);
            JsonNode player = findPlayer(room, playerId);
            if (player == null) throw new PlayerNotFoundException();
            String storedName = player.path("playerName").asString();
            if (!storedName.equals(request.playerName())) throw new PlayerNameMismatchException();
            StartGameEvent event = new StartGameEvent(request.gameId(), storedName, request.roleId());
            lifecycle.start(roomCode, request.gameId(), playerId, storedName, request.roleId(), () -> publish("/broadcast/distribution/rooms/" + roomCode + "/start-game/" + playerId, event));
            lobby.broadcast(roomCode);
        } finally {
            if (owner != null) lock.release(roomCode, owner);
        }
    }

    public void end(String roomCode, EndGameRequest request) {
        RoomCodeFormat.requireCanonical(roomCode);
        String owner = null;
        try {
            owner = lock.acquireOrThrow(roomCode);
            RoomSnapshot room = requireRoom(roomCode);
            var summary = PublicRoomSummaryMapper.completed(room.root().path("lastCompletedGame"));
            EndGameEvent event = summary == null ? new EndGameEvent(request.gameId()) : new EndGameEvent(request.gameId(), summary.winningSide(), summary.roles());
            lifecycle.end(roomCode, request.gameId(), () -> publish("/broadcast/rooms/" + roomCode + "/end-game", event));
            lobby.broadcast(roomCode);
        } finally {
            if (owner != null) lock.release(roomCode, owner);
        }
    }

    public void setupUpdated(String roomCode) {
        RoomCodeFormat.requireCanonical(roomCode);
        requireRoom(roomCode);
        lobby.broadcast(roomCode);
    }

    public void replayAfterPlayerConnect(String roomCode, String playerId) {
        GameEventLifecycleRegistry.Replay replay = lifecycle.replay(roomCode, playerId);
        try {
            if (replay instanceof GameEventLifecycleRegistry.StartReplay start) {
                RoomSnapshot room = rooms.read(roomCode);
                if (room == null || !"PLAYING".equals(room.root().path("lifecycle").asString("WAITING"))) {
                    lifecycle.invalidate(roomCode);
                    return;
                }
                JsonNode player = findPlayer(room, playerId);
                if (player == null || !start.event().roleId().wireValue().equals(player.path("roleId").asString())) {
                    lifecycle.invalidatePlayer(roomCode, playerId);
                    return;
                }
                messaging.convertAndSend("/broadcast/distribution/rooms/" + roomCode + "/start-game/" + playerId, start.event());
            } else if (replay instanceof GameEventLifecycleRegistry.EndReplay end) {
                RoomSnapshot room = rooms.read(roomCode);
                var summary = room == null ? null : PublicRoomSummaryMapper.completed(room.root().path("lastCompletedGame"));
                messaging.convertAndSend("/broadcast/rooms/" + roomCode + "/end-game", summary == null ? new EndGameEvent(end.gameId()) : new EndGameEvent(end.gameId(), summary.winningSide(), summary.roles()));
            }
        } catch (RuntimeException ignored) {
        }
    }

    private RoomSnapshot requireRoom(String roomCode) {
        RoomSnapshot room = rooms.read(roomCode);
        if (room == null) throw new RoomNotFoundException();
        return room;
    }

    private JsonNode findPlayer(RoomSnapshot room, String playerId) {
        for (JsonNode player : room.root().withArray("players"))
            if (playerId.equals(player.path("playerId").asString())) return player;
        return null;
    }

    private void publish(String destination, Object event) {
        try {
            messaging.convertAndSend(destination, event);
        } catch (RuntimeException exception) {
            throw new RealtimePublicationException(exception);
        }
    }
}
