package com.masoi.room.exception;

public class GameEventConflictException extends RuntimeException {
    public GameEventConflictException() {
        super("Game event conflicts with the current lifecycle");
    }
}
