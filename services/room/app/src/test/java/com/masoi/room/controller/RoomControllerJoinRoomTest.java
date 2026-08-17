package com.masoi.room.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasSize;

import com.masoi.room.dto.response.JoinRoomResponse;
import com.masoi.room.exception.GlobalExceptionHandler;
import com.masoi.room.exception.*;
import com.masoi.room.service.LobbyService;
import com.masoi.room.service.RoomService;
import com.masoi.room.utils.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

class RoomControllerJoinRoomTest {
    private RoomService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(RoomService.class);
        mvc = MockMvcBuilders.standaloneSetup(new RoomController(service,
                new UpdateMaxPlayersRequestParser(new ObjectMapper()), new JoinRoomRequestParser(new ObjectMapper()),
                mock(ReadyRequestParser.class), mock(LobbyService.class))).setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void returnsExactCreatedResponse() throws Exception {
        when(service.joinRoom(eq("A7K9Q2"), any())).thenReturn(new JoinRoomResponse("id", "Alice"));
        mvc.perform(post("/api/rooms/A7K9Q2/players").contentType(MediaType.APPLICATION_JSON).content("{\"playerName\":\"Alice\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.playerId").value("id")).andExpect(jsonPath("$.playerName").value("Alice"));
    }

    @Test
    void rejectsBadBodyWithExactError() throws Exception {
        mvc.perform(post("/api/rooms/A7K9Q2/players").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(content().contentType(MediaType.APPLICATION_JSON)).andExpect(jsonPath("$.*", hasSize(2)))
                .andExpect(jsonPath("$.code").value("INVALID_JOIN_ROOM_REQUEST")).andExpect(jsonPath("$.message").value("Invalid join room request"));
    }

    @Test
    void mapsApprovedJoinErrorsExactly() throws Exception {
        Object[][] cases = {{new InvalidPlayerNameException(), 400, "INVALID_PLAYER_NAME", "Player name must be between 1 and 30 characters"}, {new JoinRoomNotFoundException(), 404, "ROOM_NOT_FOUND", "Room not found"},
                {new RoomFullException(), 409, "ROOM_FULL", "Room is full"},
                {new PlayerIdGenerationExhaustedException(), 500, "PLAYER_ID_GENERATION_EXHAUSTED", "Unable to generate player ID"}, {new RoomUpdateBusyException(), 409, "ROOM_UPDATE_BUSY", "Room is currently being updated"},
                {new RoomStorageUnavailableException(new RuntimeException()), 503, "ROOM_STORAGE_UNAVAILABLE", "Room storage is unavailable"}, {new JoinRoomSerializationException(new RuntimeException()), 500, "ROOM_SERIALIZATION_ERROR", "Unable to process room data"}};
        for (Object[] item : cases) {
            doThrow((RuntimeException) item[0]).when(service).joinRoom(eq("A7K9Q2"), any());
            mvc.perform(post("/api/rooms/A7K9Q2/players").contentType(MediaType.APPLICATION_JSON).content("{\"playerName\":\"Alice\"}"))
                    .andExpect(status().is((int) item[1])).andExpect(content().contentType(MediaType.APPLICATION_JSON)).andExpect(jsonPath("$.*", hasSize(2)))
                    .andExpect(jsonPath("$.code").value((String) item[2])).andExpect(jsonPath("$.message").value((String) item[3]));
            reset(service);
        }
    }

    @Test
    void invalidRoomCodeReturnsCurrentExactError() throws Exception {
        mvc.perform(post("/api/rooms/a7k9q2/players").contentType(MediaType.APPLICATION_JSON).content("{\"playerName\":\"Alice\"}"))
                .andExpect(status().isBadRequest()).andExpect(content().contentType(MediaType.APPLICATION_JSON)).andExpect(jsonPath("$.*", hasSize(2)))
                .andExpect(jsonPath("$.code").value("INVALID_ROOM_CODE")).andExpect(jsonPath("$.message").value("Room code is invalid"));
    }
}
