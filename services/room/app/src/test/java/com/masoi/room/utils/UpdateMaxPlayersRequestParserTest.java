package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.exception.InvalidUpdateMaxPlayersRequestException;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class UpdateMaxPlayersRequestParserTest {
    private final UpdateMaxPlayersRequestParser parser = new UpdateMaxPlayersRequestParser(new ObjectMapper());

    private void assertRejected(String json) {
        byte[] body = json == null ? null : json.getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> parser.parse(body)).isInstanceOf(InvalidUpdateMaxPlayersRequestException.class);
    }

    @Test
    void acceptsExactInteger() {
        assertThat(parser.parse("{\"maxPlayers\":9}".getBytes(StandardCharsets.UTF_8)).maxPlayers()).isEqualTo(9);
    }

    @Test
    void acceptsBoundaryIntegers() {
        assertThat(parser.parse("{\"maxPlayers\":6}".getBytes(StandardCharsets.UTF_8)).maxPlayers()).isEqualTo(6);
        assertThat(parser.parse("{\"maxPlayers\":12}".getBytes(StandardCharsets.UTF_8)).maxPlayers()).isEqualTo(12);
    }

    @Test
    void rejectsMissingAndEmptyBody() {
        assertThatThrownBy(() -> parser.parse(null)).isInstanceOf(InvalidUpdateMaxPlayersRequestException.class);
        assertThatThrownBy(() -> parser.parse(new byte[0])).isInstanceOf(InvalidUpdateMaxPlayersRequestException.class);
    }

    @Test
    void rejectsMalformedJson() {
        assertRejected("not-json");
        assertRejected("{maxPlayers:9}");
        assertRejected("{\"maxPlayers\":6} {\"maxPlayers\":7}");
        assertRejected("{\"maxPlayers\":6} garbage");
    }

    @Test
    void rejectsDuplicatePropertiesInsteadOfUsingLastValue() {
        assertRejected("{\"maxPlayers\":6,\"maxPlayers\":12}");
        assertRejected("{\"unknown\":1,\"unknown\":2}");
    }

    @Test
    void rejectsMissingField() {
        assertRejected("{}");
        assertRejected("{\"other\":9}");
    }

    @Test
    void rejectsExtraField() {
        assertRejected("{\"maxPlayers\":9,\"extra\":1}");
    }

    @Test
    void rejectsNullValue() {
        assertRejected("{\"maxPlayers\":null}");
    }

    @Test
    void rejectsStringValue() {
        assertRejected("{\"maxPlayers\":\"9\"}");
    }

    @Test
    void rejectsDecimalValue() {
        assertRejected("{\"maxPlayers\":9.5}");
        assertRejected("{\"maxPlayers\":9.0}");
    }

    @Test
    void rejectsBooleanValue() {
        assertRejected("{\"maxPlayers\":true}");
    }

    @Test
    void rejectsArrayAndObjectValues() {
        assertRejected("{\"maxPlayers\":[9]}");
        assertRejected("{\"maxPlayers\":{\"x\":9}}");
    }

    @Test
    void rejectsIntegerOutsideIntRange() {
        assertRejected("{\"maxPlayers\":99999999999}");
        assertRejected("{\"maxPlayers\":-99999999999}");
    }
}
