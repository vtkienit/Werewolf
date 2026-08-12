package com.masoi.room.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.*;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.node.JsonNodeFactory;

class PrivateRoleSubscriptionAuthorizerTest {
    RoomRepository rooms = mock(RoomRepository.class);
    PlayerAuthStore auth = mock(PlayerAuthStore.class);
    PrivateRoleSubscriptionAuthorizer a = new PrivateRoleSubscriptionAuthorizer(rooms, auth);

    @Test
    void validatesMembershipAndToken() {
        var root = JsonNodeFactory.instance.objectNode();
        root.putArray("players").addObject().put("playerId", "p1");
        when(rooms.read("A7K9Q2")).thenReturn(new RoomSnapshot(root, "h", 6, 1));
        when(auth.matches("A7K9Q2", "p1", "token")).thenReturn(true);
        assertThat(a.authorize("A7K9Q2", "p1", "token")).isTrue();
        verify(rooms, never()).write(any(), any());
    }

    @Test
    void failsClosed() {
        assertThat(a.authorize("bad", "p1", "token")).isFalse();
        when(rooms.read("A7K9Q2")).thenReturn(null);
        assertThat(a.authorize("A7K9Q2", "p1", "token")).isFalse();
        assertThat(a.authorize("A7K9Q2", "p1", " ")).isFalse();
        verifyNoInteractions(auth);
    }

    @Test
    void rejectsMissingPlayerAndWrongToken() {
        var root = JsonNodeFactory.instance.objectNode();
        root.putArray("players").addObject().put("playerId", "other");
        when(rooms.read("A7K9Q2")).thenReturn(new RoomSnapshot(root, "h", 6, 1));
        assertThat(a.authorize("A7K9Q2", "p1", "token")).isFalse();
        verifyNoInteractions(auth);
    }
}
