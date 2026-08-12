package com.masoi.room.exception;

public class PlayerNameMismatchException extends RuntimeException {
    public PlayerNameMismatchException() {
        super("Player name does not match");
    }
}
