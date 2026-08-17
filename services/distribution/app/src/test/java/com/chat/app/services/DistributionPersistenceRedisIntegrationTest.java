package com.chat.app.services;

import com.chat.app.dtos.EndGameRequest;
import com.chat.app.dtos.PlayGameRequest;
import com.chat.app.dtos.RoleQuantityRequest;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

@SpringBootTest
class DistributionPersistenceRedisIntegrationTest {
    private static final String CODE = "ABC234", ROOM = "room:ABC234", LOCK = "lock:room:ABC234";
    @Autowired
    DistributionRoomStore store;
    @Autowired
    StringRedisTemplate redis;
    @Autowired
    ObjectMapper mapper;
    private RestTemplate realtime;
    private DistributionService service;

    @BeforeEach
    void setup() {
        realtime = mock(RestTemplate.class);
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));
        service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        redis.delete(ROOM);
        redis.delete(LOCK);
    }

    @AfterEach
    void clean() {
        redis.delete(ROOM);
        redis.delete(LOCK);
    }

    @Test
    void validStartEndAndRestartPreserveUnknownFieldsAndPlayers() throws Exception {
        redis.opsForValue().set(ROOM, roomJson());
        PlayGameRequest six = request(5);
        service.confirmSetup(CODE, six);
        service.playGame(CODE, six);
        var playing = mapper.readTree(redis.opsForValue().get(ROOM));
        assertThat(playing.path("lifecycle").asString()).isEqualTo("PLAYING");
        assertThat(playing.path("gameId").asString()).isNotBlank();
        assertThat(playing.path("futureRoomField").asString()).isEqualTo("preserved");
        assertThat(playing.path("players").get(0).path("futurePlayerField").asString()).isEqualTo("preserved");
        assertThatThrownBy(() -> service.playGame(CODE, six)).hasMessage("Game already started");

        service.endGame(CODE, new EndGameRequest("host", "VILLAGE"));
        var waiting = mapper.readTree(redis.opsForValue().get(ROOM));
        assertThat(waiting.path("lifecycle").asString()).isEqualTo("WAITING");
        assertThat(waiting.has("gameId")).isFalse();
        assertThat(waiting.path("maxPlayers").asInt()).isEqualTo(8);
        assertThat(waiting.path("players")).hasSize(6).allSatisfy(player -> assertThat(player.path("roleId").isNull()).isTrue());
        assertThatThrownBy(() -> service.endGame(CODE, new EndGameRequest("host", "VILLAGE"))).hasMessage("Game is not playing");
        waiting.path("players").forEach(player -> ((tools.jackson.databind.node.ObjectNode) player).put("ready", true));
        redis.opsForValue().set(ROOM, mapper.writeValueAsString(waiting));
        service.confirmSetup(CODE, six);
        assertThat(service.playGame(CODE, six).getNumberPlayers()).isEqualTo(6);
    }

    @Test
    void invalidRoleNeverMutatesRedisOrCallsRealtime() {
        String original = roomJson();
        redis.opsForValue().set(ROOM, original);
        assertThatThrownBy(() -> service.confirmSetup(CODE, new PlayGameRequest("host", List.of(new RoleQuantityRequest("not_a_role", 6)))))
                .hasMessage("Invalid role");
        assertThat(redis.opsForValue().get(ROOM)).isEqualTo(original);
        verifyNoInteractions(realtime);
    }

    @Test
    void startPublicationFailureLeavesThePersistedPlayingStateAuthoritative() throws Exception {
        redis.opsForValue().set(ROOM, roomJson());
        service.confirmSetup(CODE, request(5));
        doThrow(new IllegalStateException("room unavailable")).when(realtime)
                .postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));
        assertThatThrownBy(() -> service.playGame(CODE, request(5))).hasMessage("Realtime service unavailable");
        var stored = mapper.readTree(redis.opsForValue().get(ROOM));
        assertThat(stored.path("lifecycle").asString()).isEqualTo("PLAYING");
        assertThat(stored.path("gameId").asString()).isNotBlank();
        assertThat(stored.path("players")).allSatisfy(player -> assertThat(player.path("roleId").asString()).isNotBlank());
    }

    @Test
    void endPublicationFailureLeavesThePersistedWaitingStateAuthoritative() throws Exception {
        redis.opsForValue().set(ROOM, roomJson());
        service.confirmSetup(CODE, request(5));
        service.playGame(CODE, request(5));
        doThrow(new IllegalStateException("room unavailable")).when(realtime)
                .postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));
        assertThatThrownBy(() -> service.endGame(CODE, new EndGameRequest("host", "VILLAGE"))).hasMessage("Realtime service unavailable");
        var stored = mapper.readTree(redis.opsForValue().get(ROOM));
        assertThat(stored.path("lifecycle").asString()).isEqualTo("WAITING");
        assertThat(stored.has("gameId")).isFalse();
        assertThat(stored.path("players")).hasSize(6).allSatisfy(player -> assertThat(player.path("roleId").isNull()).isTrue());
    }

    private static PlayGameRequest request(int villagers) {
        return new PlayGameRequest("host", List.of(new RoleQuantityRequest("werewolf", 1), new RoleQuantityRequest("villager", villagers)));
    }

    private static String roomJson() {
        return "{\"roomCode\":\"ABC234\",\"hostId\":\"host\",\"maxPlayers\":8,\"lifecycle\":\"WAITING\",\"futureRoomField\":\"preserved\",\"players\":[{\"playerId\":\"p1\",\"playerName\":\"A\",\"roleId\":null,\"ready\":true,\"futurePlayerField\":\"preserved\"},{\"playerId\":\"p2\",\"playerName\":\"B\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p3\",\"playerName\":\"C\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p4\",\"playerName\":\"D\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p5\",\"playerName\":\"E\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p6\",\"playerName\":\"F\",\"roleId\":null,\"ready\":true}]}";
    }
}
