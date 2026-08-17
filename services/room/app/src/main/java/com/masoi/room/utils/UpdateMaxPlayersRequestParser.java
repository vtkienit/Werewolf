package com.masoi.room.utils;

import com.masoi.room.exception.InvalidUpdateMaxPlayersRequestException;
import com.masoi.room.dto.request.UpdateMaxPlayersRequest;
import org.springframework.stereotype.Component;
import tools.jackson.core.json.JsonFactory;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.core.ObjectReadContext;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.databind.ObjectMapper;

@Component
public class UpdateMaxPlayersRequestParser {
    private static final String FIELD = "maxPlayers";

    private final JsonFactory jsonFactory;

    public UpdateMaxPlayersRequestParser(ObjectMapper objectMapper) {
        this.jsonFactory = JsonFactory.builder()
                .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION)
                .build();
    }

    public UpdateMaxPlayersRequest parse(byte[] body) {
        if (body == null || body.length == 0) {
            throw new InvalidUpdateMaxPlayersRequestException();
        }
        try (JsonParser parser = jsonFactory.createParser(ObjectReadContext.empty(), body)) {
            if (parser.nextToken() != JsonToken.START_OBJECT
                    || parser.nextToken() != JsonToken.PROPERTY_NAME
                    || !FIELD.equals(parser.currentName())
                    || parser.nextToken() != JsonToken.VALUE_NUMBER_INT) {
                throw new InvalidUpdateMaxPlayersRequestException();
            }
            int value = parser.getIntValue();
            if (parser.nextToken() != JsonToken.END_OBJECT || parser.nextToken() != null) {
                throw new InvalidUpdateMaxPlayersRequestException();
            }
            return new UpdateMaxPlayersRequest(value);
        } catch (InvalidUpdateMaxPlayersRequestException exception) {
            throw exception;
        } catch (JacksonException exception) {
            throw new InvalidUpdateMaxPlayersRequestException(exception);
        }
    }
}
