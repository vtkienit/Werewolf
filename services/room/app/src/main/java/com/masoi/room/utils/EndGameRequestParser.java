package com.masoi.room.utils;

import com.masoi.room.dto.request.EndGameRequest;
import com.masoi.room.exception.InvalidEndGameRequestException;
import org.springframework.stereotype.Component;
import tools.jackson.core.*;
import tools.jackson.core.json.JsonFactory;
import tools.jackson.databind.ObjectMapper;

@Component
public class EndGameRequestParser {
    private final JsonFactory factory;

    public EndGameRequestParser(ObjectMapper ignored) {
        factory = JsonFactory.builder().enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build();
    }

    public EndGameRequest parse(byte[] body) {
        if (body == null || body.length == 0) throw new InvalidEndGameRequestException();
        try (JsonParser p = factory.createParser(body)) {
            if (p.nextToken() != JsonToken.START_OBJECT) throw new InvalidEndGameRequestException();
            String gameId = null;
            while (p.nextToken() != JsonToken.END_OBJECT) {
                if (p.currentToken() != JsonToken.PROPERTY_NAME || !"gameId".equals(p.currentName()) || p.nextToken() != JsonToken.VALUE_STRING)
                    throw new InvalidEndGameRequestException();
                gameId = p.getText();
            }
            if (gameId == null || gameId.isBlank() || p.nextToken() != null) throw new InvalidEndGameRequestException();
            return new EndGameRequest(gameId);
        } catch (InvalidEndGameRequestException e) {
            throw e;
        } catch (JacksonException e) {
            throw new InvalidEndGameRequestException(e);
        }
    }
}
