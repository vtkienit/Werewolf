package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
class PlayerPresenceStoreIntegrationTest {
    private static final String ROOM = "A7K9Q2";
    private static final String PLAYER = "ttt57-presence";
    @Autowired
    PlayerPresenceStore presence;
    @Autowired
    StringRedisTemplate redis;
    @Autowired
    ObjectMapper mapper;

    @AfterEach
    void clean() {
        redis.delete(PlayerPresenceStore.currentKey(ROOM, PLAYER));
        redis.delete(PlayerPresenceStore.sessionKey("ttt57-a"));
        redis.delete(PlayerPresenceStore.sessionKey("ttt57-b"));
    }

    @Test
    void reconnect_replaces_current_session_and_stale_disconnect_cannot_remove_it() {
        presence.connect(ROOM, PLAYER, "ttt57-a");
        presence.connect(ROOM, PLAYER, "ttt57-b");
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM, PLAYER))).isEqualTo("ttt57-b");
        assertThat(presence.disconnect("ttt57-a").wasCurrent()).isFalse();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM, PLAYER))).isEqualTo("ttt57-b");
        assertThat(presence.disconnect("ttt57-b").wasCurrent()).isTrue();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM, PLAYER))).isNull();
        assertThat(presence.disconnect("ttt57-b")).isNull();
    }

    @Test
    void reverse_mapping_excludes_credentials_and_role_data() {
        presence.connect(ROOM, PLAYER, "ttt57-a");
        String reverse = redis.opsForValue().get(PlayerPresenceStore.sessionKey("ttt57-a"));
        assertThat(reverse).contains("roomCode", "playerId").doesNotContain("playerToken", "roleId", "hostId", "digest");
    }

    @Test
    void findsOnlyTheRoomAndPlayerForAnExistingReverseSession() {
        presence.connect(ROOM, PLAYER, "ttt57-a");

        assertThat(presence.findAssociation("ttt57-a"))
                .isEqualTo(new PlayerPresenceStore.SessionAssociation(ROOM, PLAYER));
        assertThat(presence.findAssociation("missing")).isNull();
    }

    @Test
    void identifiesOnlyTheCurrentSessionOwner() {
        assertThat(presence.isCurrentSession(ROOM, PLAYER, "ttt57-a")).isFalse();
        presence.connect(ROOM, PLAYER, "ttt57-a");
        assertThat(presence.isCurrentSession(ROOM, PLAYER, "ttt57-a")).isTrue();
        presence.connect(ROOM, PLAYER, "ttt57-b");
        assertThat(presence.isCurrentSession(ROOM, PLAYER, "ttt57-a")).isFalse();
        assertThat(presence.isCurrentSession(ROOM, PLAYER, "ttt57-b")).isTrue();
        assertThat(presence.isCurrentSession("B7K9Q2", PLAYER, "ttt57-b")).isFalse();
        assertThat(presence.isCurrentSession(ROOM, "other", "ttt57-b")).isFalse();
    }

    @Test
    void serialization_failure_creates_no_one_sided_presence() throws Exception {
        ObjectMapper failingMapper = spy(mapper);
        doThrow(new IllegalStateException("serialization failed")).when(failingMapper).writeValueAsString(any());
        PlayerPresenceStore failingStore = new PlayerPresenceStore(redis, failingMapper);

        assertThatThrownBy(() -> failingStore.connect(ROOM, PLAYER, "ttt57-a"))
                .isInstanceOf(IllegalStateException.class).hasCauseInstanceOf(IllegalStateException.class);
        assertThat(redis.opsForValue().get(PlayerPresenceStore.currentKey(ROOM, PLAYER))).isNull();
        assertThat(redis.opsForValue().get(PlayerPresenceStore.sessionKey("ttt57-a"))).isNull();
    }
}
