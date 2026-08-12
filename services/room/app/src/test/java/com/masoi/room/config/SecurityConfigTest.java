package com.masoi.room.config;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.service.RoomService;
import com.masoi.room.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
class SecurityConfigTest {
    @Autowired
    WebApplicationContext webApplicationContext;
    @Autowired
    FilterChainProxy springSecurityFilterChain;
    @MockitoBean
    RoomService service;

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(springSecurityFilterChain)
                .build();
    }

    @Test
    void exactAnonymousCreatePostReachesControllerWithoutCsrf() throws Exception {
        when(service.createRoom()).thenReturn(new CreateRoomResponse("A7K9Q2", "host", "http://localhost/join/A7K9Q2"));
        mvc.perform(post("/api/rooms")).andExpect(status().isCreated());
        mvc.perform(post("/api/rooms").content("{}")).andExpect(status().isBadRequest());
    }

    @Test
    void exactAnonymousPatchReachesControllerWithApplication401WhenCredentialMissing() throws Exception {
        mvc.perform(patch("/api/rooms/A7K9Q2/max-players")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"maxPlayers\":9}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("HOST_CREDENTIAL_REQUIRED"));
    }

    @Test
    void everyOtherAnonymousRequestRemainsProtected() throws Exception {
        mvc.perform(get("/api/rooms")).andExpect(status().isForbidden());
        mvc.perform(post("/api/rooms/anything")).andExpect(status().isForbidden());
        mvc.perform(patch("/api/rooms/A7K9Q2/max-players/extra").contentType(MediaType.APPLICATION_JSON).content("{\"maxPlayers\":9}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/rooms/A7K9Q2/other").contentType(MediaType.APPLICATION_JSON).content("{\"maxPlayers\":9}"))
                .andExpect(status().isForbidden());
    }
}
