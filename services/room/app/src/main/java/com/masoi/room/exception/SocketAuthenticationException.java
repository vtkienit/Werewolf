package com.masoi.room.exception;

public class SocketAuthenticationException extends RuntimeException {
    public SocketAuthenticationException() {
        super("SOCKET_AUTH_FAILED");
    }
}

