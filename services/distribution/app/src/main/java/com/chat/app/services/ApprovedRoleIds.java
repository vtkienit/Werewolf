package com.chat.app.services;

import java.util.Set;
import java.util.Map;

final class ApprovedRoleIds {
    private static final Set<String> VALUES = Set.of(
            "lone_wolf", "halfblood", "mayor", "tough_guy", "rusty_knight", "diseased", "hoodlum", "cupid",
            "guard", "priest", "werewolf", "fruit_wolf", "wolf_cub", "minion", "alpha_wolf", "fang_face",
            "vampire", "witch", "seer", "aura_seer", "mystic_seeker", "apprentice_seer", "sorceress", "hunter",
            "huntress", "investigator", "spellcaster", "cursed", "old_hag", "mentalist", "gambler", "cult_leader",
            "prince", "tanner", "villager");
    private static final Map<String, String> SIDES = Map.ofEntries(
            Map.entry("lone_wolf", "WEREWOLF"), Map.entry("halfblood", "VILLAGE"), Map.entry("mayor", "VILLAGE"),
            Map.entry("tough_guy", "VILLAGE"), Map.entry("rusty_knight", "VILLAGE"), Map.entry("diseased", "VILLAGE"),
            Map.entry("hoodlum", "OTHER"), Map.entry("cupid", "VILLAGE"), Map.entry("guard", "VILLAGE"),
            Map.entry("priest", "VILLAGE"), Map.entry("werewolf", "WEREWOLF"), Map.entry("fruit_wolf", "WEREWOLF"),
            Map.entry("wolf_cub", "WEREWOLF"), Map.entry("minion", "WEREWOLF"), Map.entry("alpha_wolf", "WEREWOLF"),
            Map.entry("fang_face", "WEREWOLF"), Map.entry("vampire", "VAMPIRE"), Map.entry("witch", "VILLAGE"),
            Map.entry("seer", "VILLAGE"), Map.entry("aura_seer", "VILLAGE"), Map.entry("mystic_seeker", "VILLAGE"),
            Map.entry("apprentice_seer", "VILLAGE"), Map.entry("sorceress", "WEREWOLF"), Map.entry("hunter", "VILLAGE"),
            Map.entry("huntress", "VILLAGE"), Map.entry("investigator", "VILLAGE"), Map.entry("spellcaster", "VILLAGE"),
            Map.entry("cursed", "VILLAGE"), Map.entry("old_hag", "VILLAGE"), Map.entry("mentalist", "VILLAGE"),
            Map.entry("gambler", "VILLAGE"), Map.entry("cult_leader", "OTHER"), Map.entry("prince", "VILLAGE"),
            Map.entry("tanner", "OTHER"), Map.entry("villager", "VILLAGE"));

    private ApprovedRoleIds() {
    }

    static boolean contains(String value) {
        return value != null && VALUES.contains(value);
    }

    static int maximum(String roleId) {
        return switch (roleId) {
            case "werewolf" -> 10;
            case "vampire" -> 6;
            case "villager" -> 30;
            default -> 1;
        };
    }

    static Set<String> values() {
        return VALUES;
    }

    static String side(String roleId) {
        return SIDES.get(roleId);
    }
}
