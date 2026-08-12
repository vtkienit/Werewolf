package com.chat.app.services;

import com.chat.app.dtos.DistributionPlayerRequest;
import com.chat.app.dtos.EndGameRequest;
import com.chat.app.dtos.EndGameResponse;
import com.chat.app.dtos.PlayGameRequest;
import com.chat.app.dtos.PlayGameResponse;
import com.chat.app.dtos.HostAssignmentResponse;
import com.chat.app.dtos.ConfirmSetupResponse;
import com.chat.app.dtos.RoleQuantityRequest;
import com.chat.app.exceptions.BaseException;
import com.chat.app.utils.RoleDistributionUtils;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class DistributionService {
    private final DistributionRoomStore rooms;
    private final RestTemplate restTemplate;
    @Value("${app.room-service-url}")
    private String roomServiceUrl;
    @Value("${app.internal-realtime-token}")
    private String internalToken;

    public DistributionService(DistributionRoomStore rooms, RestTemplate restTemplate) {
        this.rooms = rooms;
        this.restTemplate = restTemplate;
    }

    public PlayGameResponse playGame(String roomCode, PlayGameRequest request) {
        String gameId = UUID.randomUUID().toString();
        List<DistributionPlayerRequest> assigned = rooms.locked(roomCode, room -> start(room, request, gameId));
        for (DistributionPlayerRequest player : assigned)
            post("/internal/realtime/rooms/{roomCode}/players/{playerId}/start-game", Map.of("gameId", gameId, "playerName", player.getPlayerName(), "roleId", player.getRoleId()), roomCode, player.getPlayerId());
        List<HostAssignmentResponse> hostAssignments = assigned.stream().map(player -> new HostAssignmentResponse(
                player.getPlayerId(), player.getPlayerName(), player.getRoleId(), roleName(player.getRoleId()))).toList();
        return PlayGameResponse.builder().roomCode(roomCode).numberPlayers(assigned.size()).gameSessionId(gameId).assignments(hostAssignments).build();
    }

    public ConfirmSetupResponse confirmSetup(String roomCode, PlayGameRequest request) {
        List<RoleQuantityRequest> activeRoles = rooms.locked(roomCode, room -> confirm(room, request));
        post("/internal/realtime/rooms/{roomCode}/setup-updated", Map.of(), roomCode);
        return new ConfirmSetupResponse(roomCode, activeRoles);
    }

    public EndGameResponse endGame(String roomCode, EndGameRequest request) {
        String hostId = request == null ? null : request.getHostId();
        String winningSide = request == null ? null : request.getWinningSide();
        String gameId = rooms.locked(roomCode, room -> {
            validateHost(room, hostId);
            if (!"PLAYING".equals(room.path("lifecycle").asText("WAITING"))) conflict("Game is not playing");
            if (winningSide == null || winningSide.isBlank())
                throw new BaseException("Winning side is required", HttpStatus.BAD_REQUEST);
            boolean validWinner = false;
            for (JsonNode player : room.withArray("players"))
                if (winningSide.equals(ApprovedRoleIds.side(player.path("roleId").asText()))) validWinner = true;
            if (!validWinner) throw new BaseException("Invalid winning side", HttpStatus.BAD_REQUEST);
            String activeGameId = room.path("gameId").asText();
            if (activeGameId.isBlank()) conflict("Game state is invalid");
            ArrayNode completedRoles = room.withArray("activeRoles").deepCopy();
            ObjectNode completed = room.putObject("lastCompletedGame");
            completed.put("winningSide", winningSide);
            completed.set("roles", completedRoles);
            for (JsonNode player : room.withArray("players")) {
                ((ObjectNode) player).putNull("roleId");
                ((ObjectNode) player).put("ready", false);
            }
            room.put("lifecycle", "WAITING");
            room.remove("gameId");
            room.putArray("activeRoles");
            return activeGameId;
        });
        post("/internal/realtime/rooms/{roomCode}/end-game", Map.of("gameId", gameId), roomCode);
        return EndGameResponse.builder().roomCode(roomCode).hostId(hostId).message("end").status("success").build();
    }

    private List<DistributionPlayerRequest> start(ObjectNode room, PlayGameRequest request, String gameId) {
        validateHost(room, request == null ? null : request.getHostId());
        if (!"WAITING".equals(room.path("lifecycle").asText("WAITING"))) conflict("Game already started");
        ArrayNode players = room.withArray("players");
        if (players.size() < 6) throw new BaseException("At least 6 players are required", HttpStatus.BAD_REQUEST);
        for (JsonNode player : players)
            if (!player.path("ready").asBoolean(false))
                throw new BaseException("All players must be ready", HttpStatus.CONFLICT);
        List<RoleQuantityRequest> requested = canonicalRoles(request == null ? null : request.getRoles());
        List<RoleQuantityRequest> confirmed = storedRoles(room.withArray("activeRoles"));
        if (confirmed.isEmpty()) conflict("Role setup is not confirmed");
        if (!sameRoles(requested, confirmed)) conflict("Confirmed role setup changed");
        List<String> roles = RoleDistributionUtils.shuffleRoles(RoleDistributionUtils.flattenRoles(confirmed));
        if (roles.size() != players.size())
            throw new BaseException("Total role quantity must equal number of players", HttpStatus.BAD_REQUEST);
        List<DistributionPlayerRequest> assigned = new ArrayList<>();
        for (int index = 0; index < players.size(); index++) {
            ObjectNode player = (ObjectNode) players.get(index);
            player.put("roleId", roles.get(index));
            assigned.add(DistributionPlayerRequest.builder().playerId(player.path("playerId").asText()).playerName(player.path("playerName").asText()).roleId(roles.get(index)).build());
        }
        room.put("lifecycle", "PLAYING");
        room.put("gameId", gameId);
        return List.copyOf(assigned);
    }

    private List<RoleQuantityRequest> confirm(ObjectNode room, PlayGameRequest request) {
        validateHost(room, request == null ? null : request.getHostId());
        if (!"WAITING".equals(room.path("lifecycle").asText("WAITING"))) conflict("Game already started");
        List<RoleQuantityRequest> roles = canonicalRoles(request == null ? null : request.getRoles());
        int total = roles.stream().mapToInt(RoleQuantityRequest::getQuantity).sum();
        if (total < 6) throw new BaseException("At least 6 roles are required", HttpStatus.BAD_REQUEST);
        if (total > 12) throw new BaseException("At most 12 roles are allowed", HttpStatus.BAD_REQUEST);
        ArrayNode stored = room.putArray("activeRoles");
        roles.forEach(role -> stored.addObject().put("roleId", role.getRoleId()).put("quantity", role.getQuantity()));
        return roles;
    }

    private static List<RoleQuantityRequest> canonicalRoles(List<RoleQuantityRequest> input) {
        if (input == null || input.isEmpty()) throw new BaseException("Roles are required", HttpStatus.BAD_REQUEST);
        TreeMap<String, Integer> totals = new TreeMap<>();
        for (RoleQuantityRequest role : input) {
            if (role == null || !ApprovedRoleIds.contains(role.getRoleId()) || role.getQuantity() < 0)
                throw new BaseException("Invalid role", HttpStatus.BAD_REQUEST);
            if (role.getQuantity() == 0) continue;
            totals.merge(role.getRoleId(), role.getQuantity(), Math::addExact);
        }
        if (totals.isEmpty()) throw new BaseException("Roles are required", HttpStatus.BAD_REQUEST);
        totals.forEach((roleId, quantity) -> {
            if (quantity > ApprovedRoleIds.maximum(roleId))
                throw new BaseException("Invalid quantity for role: " + roleId, HttpStatus.BAD_REQUEST);
        });
        return totals.entrySet().stream().map(entry -> new RoleQuantityRequest(entry.getKey(), entry.getValue())).toList();
    }

    private static List<RoleQuantityRequest> storedRoles(ArrayNode input) {
        List<RoleQuantityRequest> roles = new ArrayList<>();
        for (JsonNode role : input) {
            String roleId = role.path("roleId").asText("");
            int quantity = role.path("quantity").asInt(0);
            if (!ApprovedRoleIds.contains(roleId) || quantity <= 0) return List.of();
            roles.add(new RoleQuantityRequest(roleId, quantity));
        }
        return roles.stream().sorted(java.util.Comparator.comparing(RoleQuantityRequest::getRoleId)).toList();
    }

    private static boolean sameRoles(List<RoleQuantityRequest> left, List<RoleQuantityRequest> right) {
        return left.size() == right.size() && java.util.stream.IntStream.range(0, left.size()).allMatch(index ->
                left.get(index).getRoleId().equals(right.get(index).getRoleId()) && left.get(index).getQuantity() == right.get(index).getQuantity());
    }

    private void validateHost(ObjectNode room, String hostId) {
        if (hostId == null || hostId.isBlank()) throw new BaseException("hostId is required", HttpStatus.BAD_REQUEST);
        if (!hostId.equals(room.path("hostId").asText()))
            throw new BaseException("Invalid hostId", HttpStatus.UNAUTHORIZED);
    }

    private static void conflict(String message) {
        throw new BaseException(message, HttpStatus.CONFLICT);
    }

    private static String roleName(String roleId) {
        String[] words = roleId.split("_");
        StringBuilder name = new StringBuilder();
        for (String word : words)
            name.append(name.isEmpty() ? "" : " ").append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
        return name.toString();
    }

    private void post(String path, Object body, Object... variables) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Realtime-Token", internalToken);
        try {
            restTemplate.postForEntity(roomServiceUrl + path, new HttpEntity<>(body, headers), Void.class, variables);
        } catch (RuntimeException exception) {
            throw new BaseException("Realtime service unavailable", HttpStatus.BAD_GATEWAY);
        }
    }
}
