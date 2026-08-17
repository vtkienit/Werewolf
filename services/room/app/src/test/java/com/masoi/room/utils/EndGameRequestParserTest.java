package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.*;

import com.masoi.room.exception.InvalidEndGameRequestException;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class EndGameRequestParserTest {
    private final EndGameRequestParser parser = new EndGameRequestParser();

    @Test
    void valid() {
        assertThat(parse("{\"gameId\":\"game-001\"}").gameId()).isEqualTo("game-001");
    }

    @Test
    void invalid() {
        for (String j : new String[]{null, "", "{}", "{\"gameId\":null}", "{\"gameId\":\" \"}", "{\"gameId\":1}", "{\"gameId\":true}", "{\"gameId\":{}}", "{\"gameId\":[]}", "bad", "{\"gameId\":", "{\"gameId\":\"g\",\"gameId\":\"h\"}", "{\"gameId\":\"g\",\"extra\":1}", "{\"GameId\":\"g\"}", "{\"gameId\":\"g\"}{}", "[]", "\"x\"", "1", "null"})
            reject(j);
    }

    @Test
    void safeMessage() {
        assertThat(catchThrowable(() -> parse("{\"gameId\":\"secret-game\",\"extra\":1}")).getMessage()).isEqualTo("Invalid end game request");
    }

    private com.masoi.room.dto.request.EndGameRequest parse(String j) {
        return parser.parse(j == null ? null : j.getBytes(StandardCharsets.UTF_8));
    }

    private void reject(String j) {
        assertThatThrownBy(() -> parse(j)).isInstanceOf(InvalidEndGameRequestException.class);
    }
}
