package com.masoi.room.dto.response;

import static org.assertj.core.api.Assertions.assertThat;

import com.masoi.room.model.RoleId;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class GameEventContractSerializationTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void startContract() throws Exception {
        var e = new StartGameEvent("game-001", "Kien", RoleId.WEREWOLF);
        var j = mapper.readTree(mapper.writeValueAsString(e));
        assertThat(j.propertyNames()).containsExactlyInAnyOrder("gameId", "playerName", "roleId");
        assertThat(j.get("roleId").asString()).isEqualTo("werewolf");
        assertThat(e.toString()).doesNotContain("game-001", "Kien", "werewolf", "WEREWOLF");
    }

    @Test
    void endContract() throws Exception {
        var e = new EndGameEvent("game-001");
        var j = mapper.readTree(mapper.writeValueAsString(e));
        assertThat(j.propertyNames()).containsExactly("gameId");
        assertThat(e.toString()).doesNotContain("game-001");
    }

    @Test
    void publicEndSummaryIsAdditiveAndPrivateSafe() throws Exception {
        var e = new EndGameEvent("game-001", "VILLAGE", java.util.List.of(new PublicRoleSummary("seer", 1)));
        var json = mapper.writeValueAsString(e);
        var j = mapper.readTree(json);
        assertThat(j.propertyNames()).containsExactlyInAnyOrder("gameId", "winningSide", "roles");
        assertThat(j.path("roles").get(0).propertyNames()).containsExactlyInAnyOrder("roleId", "quantity");
        assertThat(json).doesNotContain("playerId", "playerName", "hostId", "roundNote", "assignment");
    }

    @Test
    void noMetadata() throws Exception {
        assertThat(mapper.writeValueAsString(new StartGameEvent("g", "p", RoleId.SEER))).doesNotContain("token", "digest", "session", "socket", "host", "room", "snapshot", "credential");
    }
}
