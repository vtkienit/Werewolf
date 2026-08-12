package com.masoi.room.exception;

public class InvalidStartGameRequestException extends RuntimeException {
    public InvalidStartGameRequestException() {
        super("Invalid start game request");
    }

    public InvalidStartGameRequestException(Throwable cause) {
        super("Invalid start game request", cause);
    }
}
