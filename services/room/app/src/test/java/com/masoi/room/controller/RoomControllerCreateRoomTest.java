package com.masoi.room.controller;

import com.masoi.room.exception.GlobalExceptionHandler;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.masoi.room.exception.RoomCodeGenerationExhaustedException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.service.LobbyService;
import com.masoi.room.service.RoomService;
import com.masoi.room.utils.JoinRoomRequestParser;
import com.masoi.room.utils.ReadyRequestParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class RoomControllerCreateRoomTest {
    private RoomService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(RoomService.class);
        mvc = MockMvcBuilders.standaloneSetup(new RoomController(service,
                        new com.masoi.room.utils.UpdateMaxPlayersRequestParser(new tools.jackson.databind.ObjectMapper()),
                        mock(JoinRoomRequestParser.class), mock(ReadyRequestParser.class), mock(LobbyService.class)))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void acceptsAbsentAndZeroLengthBodiesWithExactJson() throws Exception {
        when(service.createRoom()).thenReturn(new CreateRoomResponse("A7K9Q2", "host", "http://localhost/join/A7K9Q2"));
        mvc.perform(post("/api/rooms")).andExpect(status().isCreated()).andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isMap()).andExpect(jsonPath("$.*").value(org.hamcrest.Matchers.hasSize(3)))
                .andExpect(jsonPath("$.roomCode").value("A7K9Q2")).andExpect(jsonPath("$.hostId").value("host"))
                .andExpect(jsonPath("$.qrUrl").value("http://localhost/join/A7K9Q2"));
        mvc.perform(post("/api/rooms").content(new byte[0])).andExpect(status().isCreated());
    }

    @Test
    void rejectsEveryNonEmptyBody() throws Exception {
        mvc.perform(post("/api/rooms").content("{}")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_CREATE_ROOM_REQUEST"));
        mvc.perform(post("/api/rooms").content(" \n")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_CREATE_ROOM_REQUEST"));
    }

    @Test
    void mapsFailuresWithoutTechnicalDetails() throws Exception {
        doThrow(new RoomCodeGenerationExhaustedException()).when(service).createRoom();
        mvc.perform(post("/api/rooms")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("ROOM_CODE_GENERATION_EXHAUSTED"));
        doThrow(new RoomStorageUnavailableException(new RuntimeException("redis-secret"))).when(service).createRoom();
        mvc.perform(post("/api/rooms")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("ROOM_STORAGE_UNAVAILABLE"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("redis-secret"))));
        doThrow(new RoomSerializationException(new RuntimeException("jackson-secret"))).when(service).createRoom();
        mvc.perform(post("/api/rooms")).andExpect(status().isInternalServerError()).andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));
        doThrow(new IllegalStateException("technical-secret")).when(service).createRoom();
        mvc.perform(post("/api/rooms")).andExpect(status().isInternalServerError()).andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("technical-secret"))));
    }
}
