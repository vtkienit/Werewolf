package com.masoi.room.utils;

import com.masoi.room.dto.request.ReadyRequest;
import com.masoi.room.exception.InvalidReadyRequestException;
import org.springframework.stereotype.Component;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.core.json.JsonFactory;

@Component
public class ReadyRequestParser {
    private final JsonFactory factory = JsonFactory.builder().enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build();

    public ReadyRequest parse(byte[] body) {
        try (JsonParser parser = factory.createParser(body == null ? new byte[0] : body)) {
            if (parser.nextToken() != JsonToken.START_OBJECT || parser.nextToken() != JsonToken.PROPERTY_NAME
                    || !"ready".equals(parser.currentName()) || parser.nextToken() != JsonToken.VALUE_TRUE && parser.currentToken() != JsonToken.VALUE_FALSE) {
                throw new InvalidReadyRequestException();
            }
            boolean ready = parser.getBooleanValue();
            if (parser.nextToken() != JsonToken.END_OBJECT || parser.nextToken() != null)
                throw new InvalidReadyRequestException();
            return new ReadyRequest(ready);
        } catch (InvalidReadyRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new InvalidReadyRequestException();
        }
    }
}
