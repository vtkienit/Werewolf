package com.chat.app.utils;

import com.chat.app.dtos.DistributionPlayerRequest;
import com.chat.app.dtos.RoleQuantityRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

class RoleDistributionUtilsTest {

    @Test
    void flattenRolesSkipsZeroQuantityAndRepeatsSelectedRoles() {
        List<RoleQuantityRequest> roles = List.of(
                new RoleQuantityRequest("werewolf", 2),
                new RoleQuantityRequest("seer", 0),
                new RoleQuantityRequest("villager", 3)
        );

        List<String> rolePool = RoleDistributionUtils.flattenRoles(roles);

        assertThat(rolePool)
                .containsExactly("werewolf", "werewolf", "villager", "villager", "villager");
    }

    @Test
    void shuffleRolesReturnsNewListWithoutChangingOriginalList() {
        List<String> originalRoles = List.of("werewolf", "seer", "guard", "villager");

        List<String> shuffledRoles = RoleDistributionUtils.shuffleRoles(originalRoles, new Random(7));

        assertThat(shuffledRoles)
                .containsExactlyInAnyOrderElementsOf(originalRoles);
        assertThat(originalRoles)
                .containsExactly("werewolf", "seer", "guard", "villager");
    }

    @Test
    void assignRolesKeepsPlayerInfoAndAssignsRoleByIndex() {
        List<DistributionPlayerRequest> players = List.of(
                new DistributionPlayerRequest("p1", "Alice", null),
                new DistributionPlayerRequest("p2", "Bob", null)
        );

        List<DistributionPlayerRequest> assignedPlayers = RoleDistributionUtils.assignRoles(
                players,
                List.of("seer", "werewolf")
        );

        assertThat(assignedPlayers)
                .extracting(DistributionPlayerRequest::getPlayerId)
                .containsExactly("p1", "p2");
        assertThat(assignedPlayers)
                .extracting(DistributionPlayerRequest::getRoleId)
                .containsExactly("seer", "werewolf");
    }
}
