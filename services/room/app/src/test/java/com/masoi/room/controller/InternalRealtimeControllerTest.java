package com.masoi.room.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.masoi.room.dto.request.EndGameRequest;
import com.masoi.room.dto.request.StartGameRequest;
import com.masoi.room.exception.*;
import com.masoi.room.model.RoleId;
import com.masoi.room.service.GameEventService;
import com.masoi.room.utils.EndGameRequestParser;
import com.masoi.room.utils.StartGameRequestParser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

class InternalRealtimeControllerTest {
    private final GameEventService service = mock(GameEventService.class);
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        ObjectMapper mapper = new ObjectMapper();
        mvc = MockMvcBuilders.standaloneSetup(new InternalRealtimeController(service,
                        new StartGameRequestParser(mapper), new EndGameRequestParser(mapper)))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void exactBodiesDelegateAndReturnEmptyAccepted() throws Exception {
        mvc.perform(post("/internal/realtime/rooms/ABC234/players/p1/start-game").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gameId\":\"game-001\",\"playerName\":\"Kien\",\"roleId\":\"werewolf\"}"))
                .andExpect(status().isAccepted()).andExpect(content().string(""));
        ArgumentCaptor<StartGameRequest> start = ArgumentCaptor.forClass(StartGameRequest.class);
        verify(service).start(eq("ABC234"), eq("p1"), start.capture());
        assert start.getValue().gameId().equals("game-001") && start.getValue().playerName().equals("Kien")
                && start.getValue().roleId() == RoleId.WEREWOLF;

        mvc.perform(post("/internal/realtime/rooms/ABC234/end-game").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gameId\":\"game-001\"}"))
                .andExpect(status().isAccepted()).andExpect(content().string(""));
        ArgumentCaptor<EndGameRequest> end = ArgumentCaptor.forClass(EndGameRequest.class);
        verify(service).end(eq("ABC234"), end.capture());
        assert end.getValue().gameId().equals("game-001");

        mvc.perform(post("/internal/realtime/rooms/ABC234/setup-updated").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isAccepted()).andExpect(content().string(""));
        verify(service).setupUpdated("ABC234");
    }

    @Test
    void malformedUnknownDuplicateAndMissingBodiesMapSafely() throws Exception {
        assertBadStart("{");
        assertBadStart("{\"gameId\":\"secret-game\",\"playerName\":\"Kien\",\"roleId\":\"werewolf\",\"extra\":\"x\"}");
        assertBadStart("{\"gameId\":\"a\",\"gameId\":\"b\",\"playerName\":\"Kien\",\"roleId\":\"werewolf\"}");
        mvc.perform(post("/internal/realtime/rooms/ABC234/players/p1/start-game").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_START_GAME_REQUEST"));
        mvc.perform(post("/internal/realtime/rooms/ABC234/end-game").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_END_GAME_REQUEST"));
    }

    @Test
    void serviceFailuresMapToExactSafeContracts() throws Exception {
        assertMapped(new PlayerNotFoundException(), 404, "PLAYER_NOT_FOUND");
        assertMapped(new PlayerNameMismatchException(), 409, "PLAYER_NAME_MISMATCH");
        assertMapped(new GameEventConflictException(), 409, "GAME_EVENT_CONFLICT");
        assertMapped(new RealtimePublicationException(new IllegalStateException("token-value")), 503, "REALTIME_PUBLICATION_FAILED");
    }

    private void assertBadStart(String body) throws Exception {
        mvc.perform(post("/internal/realtime/rooms/ABC234/players/p1/start-game").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_START_GAME_REQUEST"))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret-game"))));
    }

    private void assertMapped(RuntimeException failure, int status, String code) throws Exception {
        reset(service);
        doThrow(failure).when(service).start(anyString(), anyString(), any(StartGameRequest.class));
        mvc.perform(post("/internal/realtime/rooms/ABC234/players/p1/start-game").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gameId\":\"secret-game\",\"playerName\":\"Secret Name\",\"roleId\":\"werewolf\"}"))
                .andExpect(status().is(status)).andExpect(jsonPath("$.code").value(code))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret-game"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Secret Name"))));
    }
}
