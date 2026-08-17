package com.masoi.room.utils;

import com.masoi.room.dto.request.PlayerConnectRequest;
import com.masoi.room.exception.SocketAuthenticationException;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.core.ObjectReadContext;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.core.json.JsonFactory;
import tools.jackson.databind.ObjectMapper;
import com.masoi.room.utils.RoomCodeFormat;
import org.springframework.stereotype.Component;

@Component
public class PlayerConnectRequestParser {
    private final JsonFactory jsonFactory;

    public PlayerConnectRequestParser(ObjectMapper mapper) {
        jsonFactory = JsonFactory.builder().enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build();
    }

    public PlayerConnectRequest parse(String roomCode, String body) {
        RoomCodeFormat.requireCanonical(roomCode);
        try {
            if (body == null || body.isBlank()) throw new SocketAuthenticationException();
            try (JsonParser parser = jsonFactory.createParser(ObjectReadContext.empty(), body)) {
                if (parser.nextToken() != JsonToken.START_OBJECT || parser.nextToken() != JsonToken.PROPERTY_NAME)
                    throw new SocketAuthenticationException();
                if ("hostId".equals(parser.currentName())) {
                    if (parser.nextToken() != JsonToken.VALUE_STRING) throw new SocketAuthenticationException();
                    String hostId = parser.getString();
                    if (hostId.isBlank() || parser.nextToken() != JsonToken.END_OBJECT || parser.nextToken() != null)
                        throw new SocketAuthenticationException();
                    return PlayerConnectRequest.host(hostId);
                }
                if (!"playerId".equals(parser.currentName()) || parser.nextToken() != JsonToken.VALUE_STRING)
                    throw new SocketAuthenticationException();
                String playerId = parser.getString();
                if (parser.nextToken() != JsonToken.PROPERTY_NAME || !"playerToken".equals(parser.currentName())
                        || parser.nextToken() != JsonToken.VALUE_STRING) throw new SocketAuthenticationException();
                String playerToken = parser.getString();
                if (playerId.isBlank() || playerToken.isBlank() || parser.nextToken() != JsonToken.END_OBJECT || parser.nextToken() != null)
                    throw new SocketAuthenticationException();
                return new PlayerConnectRequest(playerId, playerToken);
            }
        } catch (SocketAuthenticationException exception) {
            throw exception;
        } catch (JacksonException exception) {
            throw new SocketAuthenticationException();
        }
    }
}
