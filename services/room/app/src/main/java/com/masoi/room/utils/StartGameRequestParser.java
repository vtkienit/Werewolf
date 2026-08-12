package com.masoi.room.utils;

import com.masoi.room.dto.request.StartGameRequest;
import com.masoi.room.exception.*;
import com.masoi.room.model.RoleId;
import org.springframework.stereotype.Component;
import tools.jackson.core.*;
import tools.jackson.core.json.JsonFactory;
import tools.jackson.databind.ObjectMapper;

@Component
public class StartGameRequestParser {
    private final JsonFactory factory;

    public StartGameRequestParser(ObjectMapper ignored) {
        factory = JsonFactory.builder().enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build();
    }

    public StartGameRequest parse(byte[] body) {
        if (body == null || body.length == 0) throw new InvalidStartGameRequestException();
        try (JsonParser p = factory.createParser(body)) {
            if (p.nextToken() != JsonToken.START_OBJECT) throw new InvalidStartGameRequestException();
            String gameId = null, playerName = null, roleValue = null;
            while (p.nextToken() != JsonToken.END_OBJECT) {
                if (p.currentToken() != JsonToken.PROPERTY_NAME) throw new InvalidStartGameRequestException();
                String field = p.currentName();
                if (p.nextToken() != JsonToken.VALUE_STRING) throw new InvalidStartGameRequestException();
                switch (field) {
                    case "gameId" -> gameId = p.getText();
                    case "playerName" -> playerName = p.getText();
                    case "roleId" -> roleValue = p.getText();
                    default -> throw new InvalidStartGameRequestException();
                }
            }
            if (gameId == null || gameId.isBlank() || playerName == null || playerName.isBlank() || roleValue == null || roleValue.isBlank() || p.nextToken() != null)
                throw new InvalidStartGameRequestException();
            return new StartGameRequest(gameId, playerName, RoleId.fromWireValue(roleValue));
        } catch (InvalidStartGameRequestException e) {
            throw e;
        } catch (InvalidRoleIdException | JacksonException e) {
            throw new InvalidStartGameRequestException(e);
        }
    }
}
