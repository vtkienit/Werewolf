package com.masoi.room.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.exception.RoomStorageUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;

class PlayerAuthStoreTest {
    @Test
    void digest_is_url_safe_and_not_plaintext() {
        String digest = PlayerAuthStore.digest("token-value");
        assertThat(digest).hasSize(43).doesNotContain("=").isNotEqualTo("token-value");
    }

    @Test
    void exactDeleteUsesOnlyTheOwnedKeyAndTranslatesRedisFailure() {
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        PlayerAuthStore store = new PlayerAuthStore(redis);

        store.deleteExact("A7K9Q2", "player-a");
        verify(redis).delete("player:auth:A7K9Q2:player-a");
        doThrow(new IllegalStateException("redis")).when(redis).delete("player:auth:A7K9Q2:player-a");

        assertThatThrownBy(() -> store.deleteExact("A7K9Q2", "player-a"))
                .isInstanceOf(RoomStorageUnavailableException.class);
    }
}

