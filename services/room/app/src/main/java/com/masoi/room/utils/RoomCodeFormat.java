package com.masoi.room.utils;

import com.masoi.room.exception.InvalidRoomCodeException;

public final class RoomCodeFormat {
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 6;

    private RoomCodeFormat() {
    }

    public static void requireCanonical(String roomCode) {
        if (!isValid(roomCode)) {
            throw new InvalidRoomCodeException();
        }
    }

    public static boolean isValid(String roomCode) {
        if (roomCode == null || roomCode.length() != LENGTH) {
            return false;
        }
        for (int index = 0; index < LENGTH; index++) {
            if (ALPHABET.indexOf(roomCode.charAt(index)) < 0) {
                return false;
            }
        }
        return true;
    }
}
