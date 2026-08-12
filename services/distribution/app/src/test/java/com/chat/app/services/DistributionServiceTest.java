package com.chat.app.services;

import com.chat.app.dtos.EndGameRequest;
import com.chat.app.dtos.PlayGameRequest;
import com.chat.app.dtos.RoleQuantityRequest;

import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class DistributionServiceTest {
    @Test
    void startEndAndStartAgainMutateOneLockedRoom() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));

        PlayGameRequest request = new PlayGameRequest("host", List.of(new RoleQuantityRequest("werewolf", 1), new RoleQuantityRequest("villager", 5)));
        assertThat(service.confirmSetup("ABC234", request).activeRoles()).hasSize(2);
        assertThat(service.playGame("ABC234", request).getNumberPlayers()).isEqualTo(6);
        assertThat(room.path("lifecycle").asText()).isEqualTo("PLAYING");
        assertThatThrownBy(() -> service.playGame("ABC234", request)).hasMessage("Game already started");
        service.endGame("ABC234", new EndGameRequest("host", "VILLAGE"));
        assertThat(room.path("lifecycle").asText()).isEqualTo("WAITING");
        assertThat(room.withArray("players")).allSatisfy(player -> assertThat(player.path("roleId").isNull()).isTrue());
        assertThat(room.withArray("players")).allSatisfy(player -> assertThat(player.path("ready").asBoolean()).isFalse());
        assertThat(room.withArray("activeRoles")).isEmpty();
        assertThat(room.path("lastCompletedGame").path("winningSide").asText()).isEqualTo("VILLAGE");
        assertThat(room.path("lastCompletedGame").path("roles")).hasSize(2);
        room.withArray("players").forEach(player -> ((ObjectNode) player).put("ready", true));
        service.confirmSetup("ABC234", request);
        assertThat(service.playGame("ABC234", request).getNumberPlayers()).isEqualTo(6);
        service.endGame("ABC234", new EndGameRequest("host", "WEREWOLF"));
        assertThat(room.path("lastCompletedGame").path("winningSide").asText()).isEqualTo("WEREWOLF");
    }

    @Test
    void startRequiresEveryPlayerReadyAndEndRequiresValidWinner() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        ((ObjectNode) room.withArray("players").get(0)).put("ready", false);
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));
        PlayGameRequest request = new PlayGameRequest("host", List.of(new RoleQuantityRequest("werewolf", 1), new RoleQuantityRequest("villager", 5)));

        assertThat(service.confirmSetup("ABC234", request).activeRoles()).hasSize(2);
        assertThatThrownBy(() -> service.playGame("ABC234", request)).hasMessage("All players must be ready");
        ((ObjectNode) room.withArray("players").get(0)).put("ready", true);
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));
        service.playGame("ABC234", request);
        assertThatThrownBy(() -> service.endGame("ABC234", new EndGameRequest("host", null))).hasMessage("Winning side is required");
        assertThatThrownBy(() -> service.endGame("ABC234", new EndGameRequest("host", "NOT_A_SIDE"))).hasMessage("Invalid winning side");
    }

    @Test
    void invalidRoleRejectsBeforeMutationOrRealtime() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));
        PlayGameRequest request = new PlayGameRequest("host", List.of(new RoleQuantityRequest("not_a_role", 6)));
        assertThatThrownBy(() -> service.confirmSetup("ABC234", request)).hasMessage("Invalid role");
        assertThat(room.path("lifecycle").asText()).isEqualTo("WAITING");
        assertThat(room.has("gameId")).isFalse();
        assertThat(room.withArray("players")).allSatisfy(player -> assertThat(player.path("roleId").isNull()).isTrue());
        verifyNoInteractions(realtime);
    }

    @Test
    void confirmationIgnoresReadyAndAggregatesDuplicateRolesDeterministically() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        room.withArray("players").forEach(player -> ((ObjectNode) player).put("ready", false));
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));

        var response = service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(
                new RoleQuantityRequest("villager", 2), new RoleQuantityRequest("werewolf", 1), new RoleQuantityRequest("villager", 3))));

        assertThat(response.activeRoles()).extracting(RoleQuantityRequest::getRoleId, RoleQuantityRequest::getQuantity)
                .containsExactly(org.assertj.core.groups.Tuple.tuple("villager", 5), org.assertj.core.groups.Tuple.tuple("werewolf", 1));
        assertThat(room.withArray("activeRoles")).allSatisfy(role -> assertThat(role.propertyNames()).containsExactlyInAnyOrder("roleId", "quantity"));
        assertThat(room.toString()).doesNotContain("lastCompletedGame");
    }

    @Test
    void confirmationAcceptsSixRolesWithFewerThanSixUnreadyPlayers() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        while (room.withArray("players").size() > 1)
            room.withArray("players").remove(room.withArray("players").size() - 1);
        ((ObjectNode) room.withArray("players").get(0)).put("ready", false);
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));

        var response = service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(
                new RoleQuantityRequest("werewolf", 1), new RoleQuantityRequest("villager", 5))));

        assertThat(response.activeRoles()).extracting(RoleQuantityRequest::getQuantity).containsExactly(5, 1);
        assertThat(room.withArray("activeRoles")).hasSize(2);
    }

    @Test
    void confirmationAcceptsTwelveRolesIndependentOfCurrentPlayerCount() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        RestTemplate realtime = mock(RestTemplate.class);
        DistributionService service = new DistributionService(store, realtime);
        ReflectionTestUtils.setField(service, "roomServiceUrl", "http://room");
        ReflectionTestUtils.setField(service, "internalToken", "test-token");
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        room.withArray("players").forEach(player -> ((ObjectNode) player).put("ready", false));
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));
        doReturn(null).when(realtime).postForEntity(any(String.class), any(), any(Class.class), any(Object[].class));

        var response = service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(
                new RoleQuantityRequest("werewolf", 2), new RoleQuantityRequest("villager", 10))));

        assertThat(response.activeRoles()).extracting(RoleQuantityRequest::getQuantity).containsExactly(10, 2);
        assertThatThrownBy(() -> service.playGame("ABC234", new PlayGameRequest("host", response.activeRoles())))
                .hasMessage("All players must be ready");
    }

    @Test
    void confirmationRejectsRoleTotalsOutsideRangeAndRoleSpecificMaximums() throws Exception {
        DistributionRoomStore store = mock(DistributionRoomStore.class);
        DistributionService service = new DistributionService(store, mock(RestTemplate.class));
        ObjectNode room = (ObjectNode) new ObjectMapper().readTree(roomJson());
        org.mockito.Mockito.when(store.locked(org.mockito.ArgumentMatchers.eq("ABC234"), any())).thenAnswer(invocation -> ((Function<ObjectNode, ?>) invocation.getArgument(1)).apply(room));

        assertThatThrownBy(() -> service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(new RoleQuantityRequest("villager", 5)))))
                .hasMessage("At least 6 roles are required");
        assertThatThrownBy(() -> service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(new RoleQuantityRequest("villager", 13)))))
                .hasMessage("At most 12 roles are allowed");
        assertThatThrownBy(() -> service.confirmSetup("ABC234", new PlayGameRequest("host", List.of(new RoleQuantityRequest("seer", 6)))))
                .hasMessage("Invalid quantity for role: seer");
    }

    private static String roomJson() {
        return "{\"roomCode\":\"ABC234\",\"hostId\":\"host\",\"maxPlayers\":8,\"lifecycle\":\"WAITING\",\"players\":[" +
                "{\"playerId\":\"p1\",\"playerName\":\"A\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p2\",\"playerName\":\"B\",\"roleId\":null,\"ready\":true}," +
                "{\"playerId\":\"p3\",\"playerName\":\"C\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p4\",\"playerName\":\"D\",\"roleId\":null,\"ready\":true}," +
                "{\"playerId\":\"p5\",\"playerName\":\"E\",\"roleId\":null,\"ready\":true},{\"playerId\":\"p6\",\"playerName\":\"F\",\"roleId\":null,\"ready\":true}]}";
    }
}
