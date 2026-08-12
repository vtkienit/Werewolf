package com.chat.app.utils;

import java.security.SecureRandom;

public final class IdGenerator {

    private static final String CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private static final SecureRandom RANDOM = new SecureRandom();

    private IdGenerator() {
    }

    public static String generateRoomCode() {
        return generate(6);
    }

    public static String generateHostId() {
        return generate(6);
    }

    public static String generatePlayerId() {
        return generate(8);
    }

    private static String generate(int length) {
        StringBuilder result = new StringBuilder(length);

        for (int index = 0; index < length; index++) {
            int randomIndex = RANDOM.nextInt(CHARACTERS.length());
            result.append(CHARACTERS.charAt(randomIndex));
        }

        return result.toString();
    }
}