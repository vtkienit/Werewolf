package com.masoi.room.controller;

import com.masoi.room.dto.request.UpdateMaxPlayersRequest;
import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.dto.response.JoinRoomResponse;
import com.masoi.room.exception.HostCredentialRequiredException;
import com.masoi.room.exception.InvalidCreateRoomRequestException;
import com.masoi.room.service.RoomService;
import com.masoi.room.utils.RoomCodeFormat;
import com.masoi.room.utils.UpdateMaxPlayersRequestParser;
import com.masoi.room.utils.JoinRoomRequestParser;
import com.masoi.room.utils.ReadyRequestParser;
import com.masoi.room.service.LobbyService;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class RoomController {
    private final RoomService roomService;
    private final UpdateMaxPlayersRequestParser requestParser;
    private final JoinRoomRequestParser joinRequestParser;
    private final ReadyRequestParser readyRequestParser;
    private final LobbyService lobby;

    @Autowired
    public RoomController(RoomService roomService, UpdateMaxPlayersRequestParser requestParser, JoinRoomRequestParser joinRequestParser, ReadyRequestParser readyRequestParser, LobbyService lobby) {
        this.roomService = roomService;
        this.requestParser = requestParser;
        this.joinRequestParser = joinRequestParser;
        this.readyRequestParser = readyRequestParser;
        this.lobby = lobby;
    }

    @PostMapping("/api/rooms")
    public ResponseEntity<CreateRoomResponse> create(HttpServletRequest request) throws IOException {
        if (request.getInputStream().readAllBytes().length != 0) {
            throw new InvalidCreateRoomRequestException();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom());
    }

    @PatchMapping(value = "/api/rooms/{roomCode}/max-players",
            consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UpdateMaxPlayersResponse> update(
            @PathVariable("roomCode") String roomCode,
            @RequestHeader(value = "X-Host-Id", required = false) String hostId,
            HttpServletRequest httpRequest) throws IOException {
        RoomCodeFormat.requireCanonical(roomCode);
        if (hostId == null || hostId.isBlank()) {
            throw new HostCredentialRequiredException();
        }
        UpdateMaxPlayersRequest request = requestParser.parse(httpRequest.getInputStream().readAllBytes());
        UpdateMaxPlayersResponse response = roomService.updateMaxPlayers(roomCode, hostId, request.maxPlayers());
        if (lobby != null) lobby.broadcast(roomCode);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    public RoomController(RoomService roomService, UpdateMaxPlayersRequestParser requestParser) {
        this(roomService, requestParser, new JoinRoomRequestParser(new tools.jackson.databind.ObjectMapper()), new ReadyRequestParser(), null);
    }

    public RoomController(RoomService roomService, UpdateMaxPlayersRequestParser requestParser, JoinRoomRequestParser joinRequestParser) {
        this(roomService, requestParser, joinRequestParser, new ReadyRequestParser(), null);
    }

    @PostMapping(value = "/api/rooms/{roomCode}/players", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JoinRoomResponse> join(@PathVariable("roomCode") String roomCode,
                                                 HttpServletRequest httpRequest) throws IOException {
        RoomCodeFormat.requireCanonical(roomCode);
        JoinRoomRequest request = joinRequestParser.parse(httpRequest.getInputStream().readAllBytes());
        JoinRoomResponse response = roomService.joinRoom(roomCode, request);
        if (lobby != null) lobby.broadcast(roomCode);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping(value = "/api/rooms/{roomCode}/players/{playerId}/ready", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> ready(@PathVariable String roomCode, @PathVariable String playerId,
                                      @RequestHeader(value = "X-Player-Token", required = false) String playerToken,
                                      HttpServletRequest request) throws IOException {
        var body = readyRequestParser.parse(request.getInputStream().readAllBytes());
        roomService.updateReady(roomCode, playerId, playerToken, body.ready());
        lobby.broadcast(roomCode);
        return ResponseEntity.noContent().build();
    }
}
