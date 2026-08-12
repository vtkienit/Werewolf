package com.masoi.room.exception;

public class InvalidEndGameRequestException extends RuntimeException {
    public InvalidEndGameRequestException() {
        super("Invalid end game request");
    }

    public InvalidEndGameRequestException(Throwable cause) {
        super("Invalid end game request", cause);
    }
}
