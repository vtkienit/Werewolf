package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;

class SecureLockOwnerTokenGeneratorTest {
    private static final int TOKEN_BYTES = 16;

    @Test
    void producesUnpaddedBase64UrlOf16RandomBytes() {
        SecureLockOwnerTokenGenerator generator = new SecureLockOwnerTokenGenerator();
        String token = generator.generate();
        byte[] decoded = Base64.getUrlDecoder().decode(token);
        assertThat(decoded).hasSize(TOKEN_BYTES);
        assertThat(token).doesNotContain("+", "/", "=");
    }

    @Test
    void producesUniqueTokensPerCall() {
        SecureLockOwnerTokenGenerator generator = new SecureLockOwnerTokenGenerator();
        Set<String> tokens = new LinkedHashSet<>();
        for (int index = 0; index < 256; index++) {
            tokens.add(generator.generate());
        }
        assertThat(tokens).hasSize(256);
    }
}
