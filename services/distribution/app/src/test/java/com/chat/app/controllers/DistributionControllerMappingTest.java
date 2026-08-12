package com.chat.app.controllers;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.PostMapping;

import static org.assertj.core.api.Assertions.assertThat;

class DistributionControllerMappingTest {
    @Test
    void exposesOnlyRoomScopedPostMappings() {
        assertThat(Arrays.stream(DistributionController.class.getDeclaredMethods())
                .map(method -> method.getAnnotation(PostMapping.class))
                .filter(java.util.Objects::nonNull)
                .flatMap(mapping -> Arrays.stream(mapping.value())))
                .containsExactlyInAnyOrder("/rooms/{roomCode}", "/rooms/{roomCode}/setup", "/rooms/{roomCode}/end-game");
    }
}
