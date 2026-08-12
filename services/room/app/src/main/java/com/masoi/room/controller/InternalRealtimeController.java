package com.masoi.room.controller;

import com.masoi.room.service.GameEventService;
import com.masoi.room.utils.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/realtime/rooms")
public class InternalRealtimeController {
    private final GameEventService service;
    private final StartGameRequestParser starts;
    private final EndGameRequestParser ends;

    public InternalRealtimeController(GameEventService service, StartGameRequestParser starts, EndGameRequestParser ends) {
        this.service = service;
        this.starts = starts;
        this.ends = ends;
    }

    @PostMapping(value = "/{roomCode}/players/{playerId}/start-game", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> start(@PathVariable String roomCode, @PathVariable String playerId, @RequestBody(required = false) byte[] body) {
        service.start(roomCode, playerId, starts.parse(body));
        return ResponseEntity.accepted().build();
    }

    @PostMapping(value = "/{roomCode}/end-game", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> end(@PathVariable String roomCode, @RequestBody(required = false) byte[] body) {
        service.end(roomCode, ends.parse(body));
        return ResponseEntity.accepted().build();
    }

    @PostMapping(value = "/{roomCode}/setup-updated", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> setupUpdated(@PathVariable String roomCode) {
        service.setupUpdated(roomCode);
        return ResponseEntity.accepted().build();
    }
}
