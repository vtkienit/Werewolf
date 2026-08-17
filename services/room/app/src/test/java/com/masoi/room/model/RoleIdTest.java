package com.masoi.room.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.exception.InvalidRoleIdException;

import java.util.Set;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class RoleIdTest {
    private static final Set<String> IDS = Set.of("lone_wolf", "halfblood", "mayor", "tough_guy", "rusty_knight", "diseased", "hoodlum", "cupid", "guard", "priest", "werewolf", "fruit_wolf", "wolf_cub", "minion", "alpha_wolf", "fang_face", "vampire", "witch", "seer", "aura_seer", "mystic_seeker", "apprentice_seer", "sorceress", "hunter", "huntress", "investigator", "spellcaster", "cursed", "old_hag", "mentalist", "gambler", "cult_leader", "prince", "tanner", "villager");

    @Test
    void exactIds() {
        assertThat(RoleId.values()).extracting(RoleId::wireValue).containsExactlyInAnyOrderElementsOf(IDS);
    }

    @Test
    void resolvesAndSerializes() throws Exception {
        var mapper = new ObjectMapper();
        for (String id : IDS) {
            assertThat(RoleId.fromWireValue(id).wireValue()).isEqualTo(id);
            assertThat(mapper.writeValueAsString(RoleId.fromWireValue(id))).isEqualTo("\"" + id + "\"");
        }
    }

    @Test
    void rejectsAliasesSafely() {
        for (String id : new String[]{null, "", " ", "WEREWOLF", "Werewolf", "unknown", " werewolf", "werewolf "})
            assertThatThrownBy(() -> RoleId.fromWireValue(id)).isInstanceOf(InvalidRoleIdException.class).hasMessage("Invalid role ID");
    }
}
