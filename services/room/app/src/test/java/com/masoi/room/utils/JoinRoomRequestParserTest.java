package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.exception.InvalidJoinRoomRequestException;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class JoinRoomRequestParserTest {
    private final JoinRoomRequestParser parser = new JoinRoomRequestParser(new ObjectMapper());

    @Test
    void acceptsOnlyOneStringPlayerNameProperty() {
        assertThat(parser.parse("{\"playerName\":\" Alice Smith \"}".getBytes()))
                .isEqualTo(new JoinRoomRequest("Alice Smith"));
    }

    @Test
    void rejectsInvalidJsonShapesAndDuplicateKeys() {
        for (String body : new String[]{"", "{", "[]", "\"Alice\"", "1", "{}", "{\"name\":\"Alice\"}",
                "{\"playerName\":null}", "{\"playerName\":true}", "{\"playerName\":1}", "{\"playerName\":{}}", "{\"playerName\":[]}",
                "{\"playerName\":\"Alice\",\"other\":1}",
                "{\"playerName\":\"Alice\",\"playerName\":\"Bob\"}",
                "{\"playerName\":\"Alice\"} {}"}) {
            assertThatThrownBy(() -> parser.parse(body.getBytes()))
                    .isInstanceOf(InvalidJoinRoomRequestException.class);
        }
    }

    @Test
    void preservesInternalWhitespaceAndDoesNotImposeLengthPolicy() {
        assertThat(parser.parse("{\"playerName\":\"  A   B  \"}".getBytes()).playerName()).isEqualTo("A   B");
        assertThat(parser.parse(("{\"playerName\":\"" + "x".repeat(31) + "\"}").getBytes()).playerName()).hasSize(31);
    }
}
