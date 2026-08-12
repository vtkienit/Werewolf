package com.masoi.room.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;

class DisconnectGracePropertiesTest {
    @Test
    void bindsTheExactLobbyDisconnectGracePeriodProperty() {
        DisconnectGraceProperties properties = new Binder(new MapConfigurationPropertySource(Map.of(
                "app.lobby.disconnect-grace-period", "10s")))
                .bind("app.lobby", Bindable.of(DisconnectGraceProperties.class))
                .orElseThrow(AssertionError::new);

        assertThat(properties.disconnectGracePeriod()).isEqualTo(Duration.ofSeconds(10));
    }

    @Test
    void rejectsZeroAndNegativeDurations() {
        assertThatThrownBy(() -> new DisconnectGraceProperties(Duration.ZERO)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DisconnectGraceProperties(Duration.ofSeconds(-1))).isInstanceOf(IllegalArgumentException.class);
    }
}
