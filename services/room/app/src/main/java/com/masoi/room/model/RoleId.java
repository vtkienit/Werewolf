package com.masoi.room.model;

import com.fasterxml.jackson.annotation.JsonValue;
import com.masoi.room.exception.InvalidRoleIdException;

public enum RoleId {
    LONE_WOLF("lone_wolf"), HALFBLOOD("halfblood"), MAYOR("mayor"), TOUGH_GUY("tough_guy"), RUSTY_KNIGHT("rusty_knight"), DISEASED("diseased"), HOODLUM("hoodlum"), CUPID("cupid"), GUARD("guard"), PRIEST("priest"), WEREWOLF("werewolf"), FRUIT_WOLF("fruit_wolf"), WOLF_CUB("wolf_cub"), MINION("minion"), ALPHA_WOLF("alpha_wolf"), FANG_FACE("fang_face"), VAMPIRE("vampire"), WITCH("witch"), SEER("seer"), AURA_SEER("aura_seer"), MYSTIC_SEEKER("mystic_seeker"), APPRENTICE_SEER("apprentice_seer"), SORCERESS("sorceress"), HUNTER("hunter"), HUNTRESS("huntress"), INVESTIGATOR("investigator"), SPELLCASTER("spellcaster"), CURSED("cursed"), OLD_HAG("old_hag"), MENTALIST("mentalist"), GAMBLER("gambler"), CULT_LEADER("cult_leader"), PRINCE("prince"), TANNER("tanner"), VILLAGER("villager");
    private final String wireValue;

    RoleId(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    public static RoleId fromWireValue(String value) {
        for (RoleId role : values()) if (role.wireValue.equals(value)) return role;
        throw new InvalidRoleIdException();
    }
}
