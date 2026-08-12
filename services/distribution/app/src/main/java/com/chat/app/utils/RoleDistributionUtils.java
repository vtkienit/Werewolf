package com.chat.app.utils;

import com.chat.app.dtos.DistributionPlayerRequest;
import com.chat.app.dtos.RoleQuantityRequest;
import com.chat.app.exceptions.BaseException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public final class RoleDistributionUtils {

    private RoleDistributionUtils() {
    }

    public static List<String> flattenRoles(List<RoleQuantityRequest> roles) {
        List<String> rolePool = new ArrayList<>();

        for (RoleQuantityRequest role : roles) {
            if (role == null || role.getRoleId() == null || role.getRoleId().isBlank()) {
                throw new BaseException("Invalid role", HttpStatus.BAD_REQUEST);
            }

            if (role.getQuantity() < 0) {
                throw new BaseException("Role quantity must be at least 0", HttpStatus.BAD_REQUEST);
            }

            // Quantity bang 0 nghia la host khong chon role nay, nen bo qua khi chia bai.
            for (int index = 0; index < role.getQuantity(); index++) {
                rolePool.add(role.getRoleId());
            }
        }

        return rolePool;
    }

    public static List<String> shuffleRoles(List<String> roles) {
        return shuffleRoles(roles, new Random());
    }

    public static List<String> shuffleRoles(List<String> roles, Random random) {
        List<String> shuffledRoles = new ArrayList<>(roles);

        // Tra ve list moi de khong lam thay doi input ban dau cua caller.
        Collections.shuffle(shuffledRoles, random);

        return shuffledRoles;
    }

    public static List<DistributionPlayerRequest> assignRoles(
            List<DistributionPlayerRequest> players,
            List<String> rolePool
    ) {
        List<DistributionPlayerRequest> assignedPlayers = new ArrayList<>();

        for (int index = 0; index < players.size(); index++) {
            DistributionPlayerRequest player = players.get(index);

            assignedPlayers.add(
                    DistributionPlayerRequest.builder()
                            .playerId(player.getPlayerId())
                            .playerName(player.getPlayerName())
                            .roleId(rolePool.get(index))
                            .build()
            );
        }

        return assignedPlayers;
    }
}
