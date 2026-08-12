package com.masoi.room.exception;

import com.masoi.room.dto.response.ApiErrorResponse;

import com.masoi.room.exception.RoomCodeGenerationExhaustedException;
import com.masoi.room.exception.InvalidCreateRoomRequestException;
import com.masoi.room.exception.HostCredentialInvalidException;
import com.masoi.room.exception.HostCredentialRequiredException;
import com.masoi.room.exception.InvalidUpdateMaxPlayersRequestException;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.exception.MaxPlayersOutOfRangeException;
import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.InvalidRoomCodeException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.exception.InvalidJoinRoomRequestException;
import com.masoi.room.exception.InvalidPlayerNameException;
import com.masoi.room.exception.RoomFullException;
import com.masoi.room.exception.PlayerNameAlreadyExistsException;
import com.masoi.room.exception.PlayerIdGenerationExhaustedException;
import com.masoi.room.exception.JoinRoomSerializationException;
import com.masoi.room.exception.JoinRoomNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(InvalidCreateRoomRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidCreateRoomRequest() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_CREATE_ROOM_REQUEST", "Create Room request body must be empty");
    }

    @ExceptionHandler(InvalidRoomCodeException.class)
    ResponseEntity<ApiErrorResponse> invalidRoomCode() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_ROOM_CODE", "Room code is invalid");
    }

    @ExceptionHandler(InvalidUpdateMaxPlayersRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidUpdateRequest() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_UPDATE_MAX_PLAYERS_REQUEST", "Update max players request is invalid");
    }

    @ExceptionHandler(InvalidJoinRoomRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidJoinRequest() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_JOIN_ROOM_REQUEST", "Invalid join room request");
    }

    @ExceptionHandler(InvalidReadyRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidReadyRequest() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_READY_REQUEST", "Ready request is invalid");
    }

    @ExceptionHandler(PlayerCredentialInvalidException.class)
    ResponseEntity<ApiErrorResponse> playerCredentialInvalid() {
        return error(HttpStatus.FORBIDDEN, "PLAYER_CREDENTIAL_INVALID", "Player credential is invalid");
    }

    @ExceptionHandler(InvalidPlayerNameException.class)
    ResponseEntity<ApiErrorResponse> invalidPlayerName() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_PLAYER_NAME", "Player name must be between 1 and 30 characters");
    }

    @ExceptionHandler(RoomFullException.class)
    ResponseEntity<ApiErrorResponse> roomFull() {
        return error(HttpStatus.CONFLICT, "ROOM_FULL", "Room is full");
    }

    @ExceptionHandler(RoomPlayingException.class)
    ResponseEntity<ApiErrorResponse> roomPlaying() {
        return error(HttpStatus.CONFLICT, "ROOM_PLAYING", "Room is currently playing");
    }

    @ExceptionHandler(PlayerNameAlreadyExistsException.class)
    ResponseEntity<ApiErrorResponse> duplicatePlayerName() {
        return error(HttpStatus.CONFLICT, "PLAYER_NAME_ALREADY_EXISTS", "Player name already exists");
    }

    @ExceptionHandler(PlayerIdGenerationExhaustedException.class)
    ResponseEntity<ApiErrorResponse> playerIdExhausted() {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "PLAYER_ID_GENERATION_EXHAUSTED", "Unable to generate player ID");
    }

    @ExceptionHandler(JoinRoomSerializationException.class)
    ResponseEntity<ApiErrorResponse> joinSerialization() {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "ROOM_SERIALIZATION_ERROR", "Unable to process room data");
    }

    @ExceptionHandler(JoinRoomNotFoundException.class)
    ResponseEntity<ApiErrorResponse> joinNotFound() {
        return error(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room not found");
    }

    @ExceptionHandler(MaxPlayersOutOfRangeException.class)
    ResponseEntity<ApiErrorResponse> outOfRange() {
        return error(HttpStatus.BAD_REQUEST, "MAX_PLAYERS_OUT_OF_RANGE", "maxPlayers must be between 6 and 12");
    }

    @ExceptionHandler(HostCredentialRequiredException.class)
    ResponseEntity<ApiErrorResponse> credentialRequired() {
        return error(HttpStatus.UNAUTHORIZED, "HOST_CREDENTIAL_REQUIRED", "Host credential is required");
    }

    @ExceptionHandler(HostCredentialInvalidException.class)
    ResponseEntity<ApiErrorResponse> credentialInvalid() {
        return error(HttpStatus.FORBIDDEN, "HOST_CREDENTIAL_INVALID", "Host credential is invalid");
    }

    @ExceptionHandler(RoomNotFoundException.class)
    ResponseEntity<ApiErrorResponse> notFound() {
        return error(HttpStatus.NOT_FOUND, "ROOM_NOT_FOUND", "Room was not found");
    }

    @ExceptionHandler(MaxPlayersBelowPlayerCountException.class)
    ResponseEntity<ApiErrorResponse> belowPlayerCount() {
        return error(HttpStatus.CONFLICT, "MAX_PLAYERS_BELOW_PLAYER_COUNT", "maxPlayers cannot be lower than the current player count");
    }

    @ExceptionHandler(RoomUpdateBusyException.class)
    ResponseEntity<ApiErrorResponse> busy() {
        return error(HttpStatus.CONFLICT, "ROOM_UPDATE_BUSY", "Room is currently being updated");
    }

    @ExceptionHandler(RoomCodeGenerationExhaustedException.class)
    ResponseEntity<ApiErrorResponse> exhausted() {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "ROOM_CODE_GENERATION_EXHAUSTED", "Room code generation is unavailable");
    }

    @ExceptionHandler(RoomStorageUnavailableException.class)
    ResponseEntity<ApiErrorResponse> storageUnavailable() {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "ROOM_STORAGE_UNAVAILABLE", "Room storage is unavailable");
    }

    @ExceptionHandler(RoomSerializationException.class)
    ResponseEntity<ApiErrorResponse> serializationError() {
        return internalError();
    }

    @ExceptionHandler(InvalidStartGameRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidStartGame() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_START_GAME_REQUEST", "Start game request is invalid");
    }

    @ExceptionHandler(InvalidEndGameRequestException.class)
    ResponseEntity<ApiErrorResponse> invalidEndGame() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_END_GAME_REQUEST", "End game request is invalid");
    }

    @ExceptionHandler(InvalidRoleIdException.class)
    ResponseEntity<ApiErrorResponse> invalidRole() {
        return error(HttpStatus.BAD_REQUEST, "INVALID_ROLE_ID", "Role ID is invalid");
    }

    @ExceptionHandler(PlayerNotFoundException.class)
    ResponseEntity<ApiErrorResponse> playerNotFound() {
        return error(HttpStatus.NOT_FOUND, "PLAYER_NOT_FOUND", "Player was not found");
    }

    @ExceptionHandler(PlayerNameMismatchException.class)
    ResponseEntity<ApiErrorResponse> playerNameMismatch() {
        return error(HttpStatus.CONFLICT, "PLAYER_NAME_MISMATCH", "Player name does not match");
    }

    @ExceptionHandler(GameEventConflictException.class)
    ResponseEntity<ApiErrorResponse> gameEventConflict() {
        return error(HttpStatus.CONFLICT, "GAME_EVENT_CONFLICT", "Game event conflicts with the current lifecycle");
    }

    @ExceptionHandler(RealtimePublicationException.class)
    ResponseEntity<ApiErrorResponse> publicationFailed() {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "REALTIME_PUBLICATION_FAILED", "Realtime event publication failed");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> internalError() {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Internal server error");
    }

    private ResponseEntity<ApiErrorResponse> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(code, message));
    }
}
