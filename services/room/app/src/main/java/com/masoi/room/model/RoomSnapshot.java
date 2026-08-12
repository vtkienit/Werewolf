package com.masoi.room.model;

import tools.jackson.databind.node.ObjectNode;

public record RoomSnapshot(ObjectNode root, String hostId, int maxPlayers, int playerCount) {
}
