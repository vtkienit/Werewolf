package com.masoi.room.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class HostCredentialTest {
    @Test
    void matchesEqualCredentials() {
        assertThat(HostCredential.matches("mP5cYgYNGxa2-WPNnTMR1Q", "mP5cYgYNGxa2-WPNnTMR1Q")).isTrue();
    }

    @Test
    void rejectsDifferentCredentialsOfSameLength() {
        assertThat(HostCredential.matches("mP5cYgYNGxa2-WPNnTMR1Q", "mP5cYgYNGxa2-WPNnTMR1R")).isFalse();
    }

    @Test
    void rejectsNullOrBlank() {
        assertThat(HostCredential.matches(null, "host")).isFalse();
        assertThat(HostCredential.matches("host", null)).isFalse();
    }
}
