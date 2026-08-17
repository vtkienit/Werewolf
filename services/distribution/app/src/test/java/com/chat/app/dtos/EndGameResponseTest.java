package com.chat.app.dtos;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EndGameResponseTest {
    @Test
    void serializesTheFrontendCompatibleSafeContract() throws Exception {
        var json = new ObjectMapper().readTree(new ObjectMapper().writeValueAsString(
                EndGameResponse.builder().roomCode("ABC234").hostId("host").message("end").status("success").build()));
        assertThat(json.propertyNames()).containsExactlyInAnyOrder("roomCode", "hostId", "message", "status");
        assertThat(json.path("hostId").isString()).isTrue();
        assertThat(json.has("players")).isFalse();
        assertThat(json.toString()).doesNotContain("roleId", "X-Internal-Realtime-Token");
    }
}
