package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.*;

import com.masoi.room.dto.request.StartGameRequest;
import com.masoi.room.exception.InvalidStartGameRequestException;
import com.masoi.room.model.RoleId;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class StartGameRequestParserTest {
    private final StartGameRequestParser parser = new StartGameRequestParser();

    @Test
    void validAnyOrder() {
        var r = parse("{\"gameId\":\"game-001\",\"playerName\":\"Kien\",\"roleId\":\"werewolf\"}");
        assertThat(r.gameId()).isEqualTo("game-001");
        assertThat(r.playerName()).isEqualTo("Kien");
        assertThat(r.roleId()).isEqualTo(RoleId.WEREWOLF);
        assertThat(parse("{\"roleId\":\"seer\",\"playerName\":\"p\",\"gameId\":\"g\"}").roleId()).isEqualTo(RoleId.SEER);
    }

    @Test
    void rejectsInvalid() {
        for (String j : new String[]{null, "", "{}", "{\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"playerName\":\"p\"}", "{\"gameId\":null,\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":\" \",\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":1,\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"playerName\":{},\"roleId\":\"seer\"}", "bad", "{\"gameId\":", "{\"gameId\":\"g\",\"gameId\":\"h\",\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"playerName\":\"p\",\"playerName\":\"q\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"playerName\":\"p\",\"roleId\":\"seer\",\"roleId\":\"witch\"}", "{\"gameId\":\"g\",\"playerName\":\"p\",\"roleId\":\"seer\",\"extra\":1}", "{\"GameId\":\"g\",\"playerName\":\"p\",\"roleId\":\"seer\"}", "{\"gameId\":\"g\",\"playerName\":\"p\",\"roleId\":\"seer\"}{}", "[]", "\"x\"", "1", "null"})
            reject(j);
    }

    @Test
    void rejectsRoleAliases() {
        for (String id : new String[]{"unknown", "WEREWOLF", "Werewolf", " werewolf", "werewolf "})
            reject("{\"gameId\":\"g\",\"playerName\":\"p\",\"roleId\":\"" + id + "\"}");
    }

    @Test
    void safeMessage() {
        assertThat(catchThrowable(() -> parse("{\"gameId\":\"secret-game\",\"playerName\":\"Secret Player\",\"roleId\":\"secret-role\"}")).getMessage()).isEqualTo("Invalid start game request");
    }

    private StartGameRequest parse(String j) {
        return parser.parse(j == null ? null : j.getBytes(StandardCharsets.UTF_8));
    }

    private void reject(String j) {
        assertThatThrownBy(() -> parse(j)).isInstanceOf(InvalidStartGameRequestException.class);
    }
}
