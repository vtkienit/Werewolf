package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SecureRoomCodeGeneratorTest {
    @Test
    void createsSixCharactersFromTheLockedAlphabet() {
        String code = new SecureRoomCodeGenerator().generate();
        assertThat(code).matches("[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}");
    }
}
