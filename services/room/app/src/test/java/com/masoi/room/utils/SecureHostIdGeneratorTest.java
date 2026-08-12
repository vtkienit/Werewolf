package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SecureHostIdGeneratorTest {
    @Test
    void createsAnUnpadded128BitBase64UrlValue() {
        assertThat(new SecureHostIdGenerator().generate()).matches("[A-Za-z0-9_-]{22}");
    }
}
