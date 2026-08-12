package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class UuidPlayerIdGeneratorTest {
    @Test
    void generatesUuidShapedIds() {
        String value = new UuidPlayerIdGenerator().generate();
        assertThat(UUID.fromString(value).toString()).isEqualTo(value);
    }
}
