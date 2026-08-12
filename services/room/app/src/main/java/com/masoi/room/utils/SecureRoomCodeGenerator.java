package com.masoi.room.utils;

import com.masoi.room.utils.RoomCodeGenerator;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class SecureRoomCodeGenerator implements RoomCodeGenerator {
    private static final char[] ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private final SecureRandom random = new SecureRandom();

    @Override
    public String generate() {
        char[] code = new char[6];
        for (int index = 0; index < code.length; index++) {
            code[index] = ALPHABET[random.nextInt(ALPHABET.length)];
        }
        return new String(code);
    }
}
