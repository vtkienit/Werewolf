package com.masoi.room.model;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class HostCredential {
    private HostCredential() {
    }

    public static boolean matches(String supplied, String stored) {
        if (supplied == null || stored == null) {
            return false;
        }
        return MessageDigest.isEqual(supplied.getBytes(StandardCharsets.UTF_8), stored.getBytes(StandardCharsets.UTF_8));
    }
}
