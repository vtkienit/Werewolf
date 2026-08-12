package com.masoi.room.service;

import com.masoi.room.dto.response.StartGameEvent;
import com.masoi.room.exception.GameEventConflictException;
import com.masoi.room.model.RoleId;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class GameEventLifecycleRegistry {
    private final ConcurrentHashMap<String, RoomState> rooms = new ConcurrentHashMap<>();

    public void start(String roomCode, String gameId, String playerId, String playerName, RoleId roleId, Runnable publish) {
        RoomState state = rooms.computeIfAbsent(roomCode, key -> new RoomState());
        synchronized (state) {
            if (state.ended.contains(gameId)) throw new GameEventConflictException();
            if (state.activeGameId != null && !state.activeGameId.equals(gameId))
                throw new GameEventConflictException();
            Assignment old = state.assignments.get(playerId);
            if (old != null) {
                if (old.roleId == roleId) return;
                throw new GameEventConflictException();
            }
            publish.run();
            state.activeGameId = gameId;
            state.assignments.put(playerId, new Assignment(new StartGameEvent(gameId, playerName, roleId), roleId));
        }
    }

    public void end(String roomCode, String gameId, Runnable publish) {
        RoomState state = rooms.computeIfAbsent(roomCode, key -> new RoomState());
        synchronized (state) {
            if (state.activeGameId == null) {
                if (gameId.equals(state.lastEndedGameId)) return;
                throw new GameEventConflictException();
            }
            if (!state.activeGameId.equals(gameId)) throw new GameEventConflictException();
            publish.run();
            state.activeGameId = null;
            state.assignments.clear();
            state.ended.add(gameId);
            state.lastEndedGameId = gameId;
        }
    }

    public Replay replay(String roomCode, String playerId) {
        RoomState state = rooms.get(roomCode);
        if (state == null) return null;
        synchronized (state) {
            if (state.activeGameId != null) {
                Assignment assignment = state.assignments.get(playerId);
                return assignment == null ? null : new StartReplay(assignment.event);
            }
            return state.lastEndedGameId == null ? null : new EndReplay(state.lastEndedGameId);
        }
    }

    public void invalidate(String roomCode) {
        rooms.remove(roomCode);
    }

    public void invalidatePlayer(String roomCode, String playerId) {
        RoomState state = rooms.get(roomCode);
        if (state != null) synchronized (state) {
            state.assignments.remove(playerId);
        }
    }

    public sealed interface Replay permits StartReplay, EndReplay {
    }

    public record StartReplay(StartGameEvent event) implements Replay {
        @Override
        public String toString() {
            return "StartReplay[REDACTED]";
        }
    }

    public record EndReplay(String gameId) implements Replay {
        @Override
        public String toString() {
            return "EndReplay[REDACTED]";
        }
    }

    private static final class RoomState {
        String activeGameId, lastEndedGameId;
        final Map<String, Assignment> assignments = new HashMap<>();
        final Set<String> ended = new HashSet<>();
    }

    private static final class Assignment {
        final StartGameEvent event;
        final RoleId roleId;

        Assignment(StartGameEvent event, RoleId roleId) {
            this.event = event;
            this.roleId = roleId;
        }

        @Override
        public String toString() {
            return "Assignment[REDACTED]";
        }
    }
}
