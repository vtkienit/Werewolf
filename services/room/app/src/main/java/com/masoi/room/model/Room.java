package com.masoi.room.model;

import java.util.List;

public record Room(String roomCode, String hostId, int maxPlayers, List<Object> players, RoomLifecycle lifecycle) {
    public Room {
        players = List.copyOf(players);
        lifecycle = lifecycle == null ? RoomLifecycle.WAITING : lifecycle;
    }

    public Room(String roomCode, String hostId, int maxPlayers, List<Object> players) {
        this(roomCode, hostId, maxPlayers, players, RoomLifecycle.WAITING);
    }

    public static Room create(String roomCode, String hostId) {
        return new Room(roomCode, hostId, 6, List.of(), RoomLifecycle.WAITING);
    }
}
