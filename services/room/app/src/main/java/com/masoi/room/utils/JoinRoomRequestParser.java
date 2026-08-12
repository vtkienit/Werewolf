package com.masoi.room.utils;

import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.exception.InvalidJoinRoomRequestException;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.core.json.JsonFactory;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.databind.ObjectMapper;

@Component
public class JoinRoomRequestParser {
    private final JsonFactory jsonFactory;

    public JoinRoomRequestParser(ObjectMapper objectMapper) {
        jsonFactory = JsonFactory.builder().enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build();
    }

    public JoinRoomRequest parse(byte[] body) {
        if (body == null || body.length == 0) throw new InvalidJoinRoomRequestException();
        try (JsonParser parser = jsonFactory.createParser(body)) {
            if (parser.nextToken() != JsonToken.START_OBJECT || parser.nextToken() != JsonToken.PROPERTY_NAME
                    || !"playerName".equals(parser.currentName()) || parser.nextToken() != JsonToken.VALUE_STRING) {
                throw new InvalidJoinRoomRequestException();
            }
            String playerName = parser.getText().trim();
            if (parser.nextToken() != JsonToken.END_OBJECT || parser.nextToken() != null)
                throw new InvalidJoinRoomRequestException();
            return new JoinRoomRequest(playerName);
        } catch (InvalidJoinRoomRequestException exception) {
            throw exception;
        } catch (JacksonException exception) {
            throw new InvalidJoinRoomRequestException(exception);
        }
    }
}
