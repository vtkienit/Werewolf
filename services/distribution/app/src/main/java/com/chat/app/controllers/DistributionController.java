package com.chat.app.controllers;

import com.chat.app.dtos.EndGameRequest;
import com.chat.app.dtos.EndGameResponse;
import com.chat.app.dtos.PlayGameRequest;
import com.chat.app.dtos.PlayGameResponse;
import com.chat.app.dtos.ConfirmSetupResponse;
import com.chat.app.services.DistributionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/distribution")
@RequiredArgsConstructor
public class DistributionController {

    private final DistributionService distributionService;

    @PostMapping("/rooms/{roomCode}")
    public ResponseEntity<PlayGameResponse> playGame(
            @PathVariable String roomCode,
            @Valid @RequestBody PlayGameRequest request
    ) {
        return ResponseEntity.ok(
                distributionService.playGame(roomCode, request)
        );
    }

    @PostMapping("/rooms/{roomCode}/setup")
    public ResponseEntity<ConfirmSetupResponse> confirmSetup(
            @PathVariable String roomCode,
            @Valid @RequestBody PlayGameRequest request
    ) {
        return ResponseEntity.ok(distributionService.confirmSetup(roomCode, request));
    }

    @PostMapping("/rooms/{roomCode}/end-game")
    public ResponseEntity<EndGameResponse> endGame(
            @PathVariable String roomCode,
            @RequestBody EndGameRequest request
    ) {
        return ResponseEntity.ok(
                distributionService.endGame(roomCode, request)
        );
    }
}
