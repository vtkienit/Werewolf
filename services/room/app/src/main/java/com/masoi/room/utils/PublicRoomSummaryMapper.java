package com.masoi.room.utils;

import com.masoi.room.dto.response.PublicCompletedGameSummary;
import com.masoi.room.dto.response.PublicRoleSummary;
import com.masoi.room.model.RoleId;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import tools.jackson.databind.JsonNode;

public final class PublicRoomSummaryMapper {
    private static final Set<String> WINNING_SIDES = Set.of("VILLAGE", "WEREWOLF", "VAMPIRE", "OTHER");

    private PublicRoomSummaryMapper() {
    }

    public static List<PublicRoleSummary> roles(JsonNode value) {
        if (value == null || !value.isArray()) return List.of();
        TreeMap<String, Integer> totals = new TreeMap<>();
        for (JsonNode item : value) {
            if (!item.isObject() || item.size() != 2 || !item.path("roleId").isString() || !item.path("quantity").isIntegralNumber())
                continue;
            String roleId = item.path("roleId").asString();
            int quantity = item.path("quantity").asInt(0);
            if (quantity <= 0 || !approved(roleId)) continue;
            totals.merge(roleId, quantity, Integer::sum);
        }
        List<PublicRoleSummary> result = new ArrayList<>();
        totals.forEach((roleId, quantity) -> result.add(new PublicRoleSummary(roleId, quantity)));
        return List.copyOf(result);
    }

    public static PublicCompletedGameSummary completed(JsonNode value) {
        if (value == null || !value.isObject() || !value.path("winningSide").isString()) return null;
        String winningSide = value.path("winningSide").asString();
        List<PublicRoleSummary> roles = roles(value.path("roles"));
        return WINNING_SIDES.contains(winningSide) && !roles.isEmpty() ? new PublicCompletedGameSummary(winningSide, roles) : null;
    }

    private static boolean approved(String roleId) {
        try {
            RoleId.fromWireValue(roleId);
            return true;
        } catch (RuntimeException ignored) {
            return false;
        }
    }
}
