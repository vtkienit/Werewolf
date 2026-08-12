package com.masoi.room.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class RoomTest {
    @Test
    void createsTheLockedInitialRecord() {
        Room room = Room.create("A7K9Q2", "host");

        assertThat(room.roomCode()).isEqualTo("A7K9Q2");
        assertThat(room.hostId()).isEqualTo("host");
        assertThat(room.maxPlayers()).isEqualTo(6);
        assertThat(room.players()).isEmpty();
        assertThatThrownBy(() -> room.players().add(new Object())).isInstanceOf(UnsupportedOperationException.class);
    }
}
