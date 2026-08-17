package com.masoi.room.controller;

import com.masoi.room.exception.GlobalExceptionHandler;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.masoi.room.exception.HostCredentialInvalidException;
import com.masoi.room.exception.MaxPlayersBelowPlayerCountException;
import com.masoi.room.exception.MaxPlayersOutOfRangeException;
import com.masoi.room.exception.RoomNotFoundException;
import com.masoi.room.exception.RoomSerializationException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.service.LobbyService;
import com.masoi.room.service.RoomService;
import com.masoi.room.utils.JoinRoomRequestParser;
import com.masoi.room.utils.ReadyRequestParser;
import com.masoi.room.utils.UpdateMaxPlayersRequestParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

class RoomControllerUpdateMaxPlayersTest {
    private static final String VALID_ROOM_CODE = "A7K9Q2";
    private static final String HOST_ID = "mP5cYgYNGxa2-WPNnTMR1Q";

    private RoomService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(RoomService.class);
        UpdateMaxPlayersRequestParser parser = new UpdateMaxPlayersRequestParser(new ObjectMapper());
        mvc = MockMvcBuilders.standaloneSetup(new RoomController(service, parser,
                        mock(JoinRoomRequestParser.class), mock(ReadyRequestParser.class), mock(LobbyService.class)))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private org.springframework.test.web.servlet.ResultActions performPatch(String roomCode, String hostId, String body) throws Exception {
        var builder = patch("/api/rooms/" + roomCode + "/max-players").contentType(MediaType.APPLICATION_JSON);
        if (hostId != null) {
            builder.header("X-Host-Id", hostId);
        }
        if (body != null) {
            builder.content(body);
        }
        return mvc.perform(builder);
    }

    @Test
    void exactPatchMappingReturnsExactSuccessJson() throws Exception {
        when(service.updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9)).thenReturn(new UpdateMaxPlayersResponse(9));
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isMap())
                .andExpect(jsonPath("$.*").value(hasSize(1)))
                .andExpect(jsonPath("$.maxPlayers").value(9))
                .andExpect(content().string(not(containsString("hostId"))))
                .andExpect(content().string(not(containsString("roomCode"))))
                .andExpect(content().string(not(containsString("players"))));
    }

    @Test
    void requiresApplicationJsonContentType() throws Exception {
        mvc.perform(patch("/api/rooms/" + VALID_ROOM_CODE + "/max-players")
                        .header("X-Host-Id", HOST_ID).content("{\"maxPlayers\":9}"))
                .andExpect(status().isUnsupportedMediaType());
        mvc.perform(patch("/api/rooms/" + VALID_ROOM_CODE + "/max-players")
                        .header("X-Host-Id", HOST_ID).contentType(MediaType.TEXT_PLAIN).content("{\"maxPlayers\":9}"))
                .andExpect(status().isUnsupportedMediaType());
        mvc.perform(patch("/api/rooms/" + VALID_ROOM_CODE + "/max-players")
                        .header("X-Host-Id", HOST_ID).contentType(MediaType.APPLICATION_XML).content("<maxPlayers>9</maxPlayers>"))
                .andExpect(status().isUnsupportedMediaType());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsInvalidRoomCodeWithoutNormalization() throws Exception {
        performPatch("a7k9q2", HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ROOM_CODE"))
                .andExpect(jsonPath("$.message").value("Room code is invalid"));
        performPatch("A7K9Q", HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ROOM_CODE"));
        verifyNoInteractions(service);
        performPatch("A7K9Q22", HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ROOM_CODE"));
    }

    @Test
    void missingOrBlankCredentialReturns401() throws Exception {
        performPatch(VALID_ROOM_CODE, null, "{\"maxPlayers\":9}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("HOST_CREDENTIAL_REQUIRED"));
        verifyNoInteractions(service);
        performPatch(VALID_ROOM_CODE, "  ", "{\"maxPlayers\":9}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("HOST_CREDENTIAL_REQUIRED"));
    }

    @Test
    void incorrectCredentialReturns403() throws Exception {
        when(service.updateMaxPlayers(VALID_ROOM_CODE, "wrong", 9)).thenThrow(new HostCredentialInvalidException());
        performPatch(VALID_ROOM_CODE, "wrong", "{\"maxPlayers\":9}")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("HOST_CREDENTIAL_INVALID"));
    }

    @Test
    void outOfRangeReturns400() throws Exception {
        when(service.updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 5)).thenThrow(new MaxPlayersOutOfRangeException());
        when(service.updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 13)).thenThrow(new MaxPlayersOutOfRangeException());
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":5}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MAX_PLAYERS_OUT_OF_RANGE"));
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":13}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MAX_PLAYERS_OUT_OF_RANGE"));
    }

    @Test
    void invalidRequestShapeReturns400() throws Exception {
        performPatch(VALID_ROOM_CODE, HOST_ID, null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
        verifyNoInteractions(service);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
        performPatch(VALID_ROOM_CODE, HOST_ID, "not-json")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":\"9\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":null}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9,\"extra\":1}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_UPDATE_MAX_PLAYERS_REQUEST"));
    }

    @Test
    void mapsServiceFailuresToExactStatusesWithoutTechnicalDetails() throws Exception {
        doThrow(new RoomNotFoundException()).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ROOM_NOT_FOUND"));

        doThrow(new MaxPlayersBelowPlayerCountException()).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("MAX_PLAYERS_BELOW_PLAYER_COUNT"));

        doThrow(new RoomUpdateBusyException()).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ROOM_UPDATE_BUSY"));

        doThrow(new RoomStorageUnavailableException(new RuntimeException("redis-secret"))).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("ROOM_STORAGE_UNAVAILABLE"))
                .andExpect(content().string(not(containsString("redis-secret"))));

        doThrow(new RoomSerializationException(new RuntimeException("jackson-secret"))).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("Internal server error"))
                .andExpect(content().string(not(containsString("HOST_CREDENTIAL_INVALID"))))
                .andExpect(content().string(not(containsString("jackson-secret"))));

        doThrow(new IllegalStateException("technical-secret")).when(service).updateMaxPlayers(VALID_ROOM_CODE, HOST_ID, 9);
        performPatch(VALID_ROOM_CODE, HOST_ID, "{\"maxPlayers\":9}")
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(content().string(not(containsString("technical-secret"))));
    }

    @Test
    void credentialNeverAppearsInAnyResponse() throws Exception {
        when(service.updateMaxPlayers(VALID_ROOM_CODE, "secret-host", 9)).thenThrow(new HostCredentialInvalidException());
        String body = performPatch(VALID_ROOM_CODE, "secret-host", "{\"maxPlayers\":9}")
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(body).doesNotContain("secret-host");
    }
}
