package com.masoi.room.exception;

public class RealtimePublicationException extends RuntimeException {
    public RealtimePublicationException(Throwable cause) {
        super("Realtime event publication failed", cause);
    }
}
