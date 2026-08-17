package com.masoi.room.service;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.dto.response.PlayerListSnapshot;
import com.masoi.room.dto.response.PublicPlayer;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.exception.SocketAuthenticationException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.model.HostCredential;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.PlayerPresenceStore;
import com.masoi.room.repository.PlayerRemovalRoomStore;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.utils.RoomCodeFormat;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.PublicRoomSummaryMapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
public class LobbyService {
    private final RoomRepository rooms;
    private final PlayerAuthStore tokens;
    private final PlayerPresenceStore presence;
    private final PlayerRemovalRoomStore removals;
    private final RoomLock lock;
    private final PendingPlayerRemovalScheduler scheduler;
    private final PendingPlayerRemovalCoordinator coordinator;
    private final SimpMessagingTemplate messaging;

    public LobbyService(RoomRepository rooms, PlayerAuthStore tokens, PlayerPresenceStore presence,
                        PlayerRemovalRoomStore removals, RoomLock lock, PendingPlayerRemovalScheduler scheduler,
                        PendingPlayerRemovalCoordinator coordinator, SimpMessagingTemplate messaging) {
        this.rooms = rooms;
        this.tokens = tokens;
        this.presence = presence;
        this.removals = removals;
        this.lock = lock;
        this.scheduler = scheduler;
        this.coordinator = coordinator;
        this.messaging = messaging;
    }

    public void connect(String roomCode, PlayerConnectRequest request, String sessionId) {
        RoomCodeFormat.requireCanonical(roomCode);
        if (request == null || sessionId == null) throw new SocketAuthenticationException();
        PendingPlayerRemovalCoordinator.PlayerKey key = new PendingPlayerRemovalCoordinator.PlayerKey(roomCode, request.playerId());
        coordinator.transition(key, pending -> {
            RoomSnapshot room = rooms.read(roomCode);
            if (room == null || !hasPlayer(room, request.playerId()) || !tokens.matches(roomCode, request.playerId(), request.playerToken())) {
                throw new SocketAuthenticationException();
            }
            presence.connect(roomCode, request.playerId(), sessionId);
            PendingPlayerRemovalCoordinator.cancel(pending);
            broadcast(roomCode);
            return PendingPlayerRemovalCoordinator.clear();
        });
    }

    public void connectHost(String roomCode, String hostId) {
        RoomCodeFormat.requireCanonical(roomCode);
        RoomSnapshot room = rooms.read(roomCode);
        if (room == null || !HostCredential.matches(hostId, room.hostId())) throw new SocketAuthenticationException();
        broadcast(roomCode);
    }

    public void disconnect(String sessionId) {
        PlayerPresenceStore.SessionAssociation resolved = presence.findAssociation(sessionId);
        if (resolved == null) return;
        PendingPlayerRemovalCoordinator.PlayerKey key = new PendingPlayerRemovalCoordinator.PlayerKey(resolved.roomCode(), resolved.playerId());
        coordinator.transition(key, pending -> {
            PlayerPresenceStore.Association disconnected = presence.disconnect(sessionId);
            if (disconnected == null || !disconnected.wasCurrent())
                return PendingPlayerRemovalCoordinator.keep(pending);
            if (presence.connected(key.roomCode(), key.playerId())) {
                PendingPlayerRemovalCoordinator.cancel(pending);
                return PendingPlayerRemovalCoordinator.clear();
            }
            PendingPlayerRemovalCoordinator.cancel(pending);
            String token = java.util.UUID.randomUUID().toString();
            PendingPlayerRemovalScheduler.Cancellation cancellation = scheduler.schedule(() -> timeout(key, token));
            PendingPlayerRemovalCoordinator.PendingRemoval next = new PendingPlayerRemovalCoordinator.PendingRemoval(
                    key.roomCode(), key.playerId(), sessionId, token, cancellation);
            broadcast(key.roomCode());
            return PendingPlayerRemovalCoordinator.keep(next);
        });
    }

    private void timeout(PendingPlayerRemovalCoordinator.PlayerKey key, String token) {
        coordinator.transition(key, pending -> {
            if (pending == null || !pending.token().equals(token)) return PendingPlayerRemovalCoordinator.keep(pending);
            if (presence.connected(key.roomCode(), key.playerId())) return PendingPlayerRemovalCoordinator.clear();
            boolean removed = false;
            String owner = null;
            try {
                owner = lock.acquireOrThrow(key.roomCode());
                if (presence.connected(key.roomCode(), key.playerId())) return PendingPlayerRemovalCoordinator.clear();
                PlayerRemovalRoomStore.RemovalResult result = removals.remove(key.roomCode(), key.playerId());
                if (result instanceof PlayerRemovalRoomStore.AlreadyAbsent)
                    return PendingPlayerRemovalCoordinator.clear();
                removed = true;
            } catch (RoomUpdateBusyException | RoomStorageUnavailableException exception) {
                if (!removed) return retry(key, pending, token);
                throw exception;
            } finally {
                if (owner != null) lock.release(key.roomCode(), owner);
            }
            RoomStorageUnavailableException cleanupFailure = null;
            try {
                tokens.deleteExact(key.roomCode(), key.playerId());
            } catch (RoomStorageUnavailableException exception) {
                cleanupFailure = exception;
            }
            broadcast(key.roomCode());
            if (cleanupFailure != null) throw cleanupFailure;
            return PendingPlayerRemovalCoordinator.clear();
        });
    }

    private PendingPlayerRemovalCoordinator.Transition<Void> retry(PendingPlayerRemovalCoordinator.PlayerKey key,
                                                                   PendingPlayerRemovalCoordinator.PendingRemoval pending,
                                                                   String token) {
        PendingPlayerRemovalScheduler.Cancellation cancellation = scheduler.schedule(() -> timeout(key, token));
        return PendingPlayerRemovalCoordinator.keep(new PendingPlayerRemovalCoordinator.PendingRemoval(
                key.roomCode(), key.playerId(), pending.sessionId(), token, cancellation));
    }

    public void broadcast(String roomCode) {
        RoomSnapshot room = rooms.read(roomCode);
        if (room == null) return;
        List<PublicPlayer> players = new ArrayList<>();
        for (JsonNode player : room.root().withArray("players")) {
            if (!player.path("playerId").isString() || !player.path("playerName").isString()) continue;
            String playerId = player.path("playerId").asString();
            players.add(new PublicPlayer(playerId, player.path("playerName").asString(), presence.connected(roomCode, playerId), player.path("ready").asBoolean(false)));
        }
        messaging.convertAndSend("/broadcast/rooms/" + roomCode + "/players",
                new PlayerListSnapshot(roomCode, room.root().path("lifecycle").asString("WAITING"), players.size(), room.maxPlayers(), List.copyOf(players),
                        PublicRoomSummaryMapper.roles(room.root().path("activeRoles")), PublicRoomSummaryMapper.completed(room.root().path("lastCompletedGame"))));
    }

    private static boolean hasPlayer(RoomSnapshot room, String playerId) {
        for (JsonNode player : room.root().withArray("players"))
            if (playerId.equals(player.path("playerId").asString())) return true;
        return false;
    }
}
