package com.masoi.room.utils;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.exception.SocketAuthenticationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class PlayerConnectRequestParserTest {
    private final PlayerConnectRequestParser parser = new PlayerConnectRequestParser(new ObjectMapper());

    @Test
    void accepts_exact_authenticated_connect_shape() {
        assertThat(parser.parse("A7K9Q2", "{\"playerId\":\"p\",\"playerToken\":\"t\"}"))
                .isEqualTo(new PlayerConnectRequest("p", "t"));
    }

    @Test
    void rejects_unknown_and_invalid_connect_shapes() {
        assertThatThrownBy(() -> parser.parse("A7K9Q2", "{\"playerId\":\"p\",\"playerToken\":\"t\",\"roleId\":null}"))
                .isInstanceOf(SocketAuthenticationException.class);
        assertThatThrownBy(() -> parser.parse("A7K9Q2", "{\"playerId\":\"a\",\"playerId\":\"b\",\"playerToken\":\"t\"}"))
                .isInstanceOf(SocketAuthenticationException.class);
        assertThatThrownBy(() -> parser.parse("A7K9Q2", "{\"playerId\":\"a\",\"playerToken\":\"one\",\"playerToken\":\"two\"}"))
                .isInstanceOf(SocketAuthenticationException.class);
        assertThatThrownBy(() -> parser.parse("bad", "{}")).isNotNull();
    }
}

