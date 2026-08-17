package com.chat.app.dtos;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlayGameResponseTest {

    @Test
    void serializesOnlyHostSafeFields() throws Exception {
        PlayGameResponse response = PlayGameResponse.builder()
                .roomCode("ABC123")
                .numberPlayers(8)
                .gameSessionId("game-1")
                .assignments(java.util.List.of(new HostAssignmentResponse("p1", "Trung", "seer", "Seer")))
                .build();

        JsonNode json = new ObjectMapper().readTree(new ObjectMapper().writeValueAsString(response));

        assertThat(json.propertyNames()).containsExactlyInAnyOrder("roomCode", "numberPlayers", "gameSessionId", "assignments");
        assertThat(json.has("hostId")).isFalse();
        assertThat(json.has("players")).isFalse();
        assertThat(json.path("assignments").get(0).path("playerId").asText()).isEqualTo("p1");
        assertThat(json.path("assignments").get(0).path("roleId").asText()).isEqualTo("seer");
    }
}
