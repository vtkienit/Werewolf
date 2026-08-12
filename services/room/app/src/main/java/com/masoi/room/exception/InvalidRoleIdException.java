package com.masoi.room.exception;

public class InvalidRoleIdException extends RuntimeException {
    public InvalidRoleIdException() {
        super("Invalid role ID");
    }
}
