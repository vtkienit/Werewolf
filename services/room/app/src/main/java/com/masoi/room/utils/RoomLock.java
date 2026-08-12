package com.masoi.room.utils;

public interface RoomLock {
    String acquireOrThrow(String roomCode);

    void release(String roomCode, String ownerToken);
}
