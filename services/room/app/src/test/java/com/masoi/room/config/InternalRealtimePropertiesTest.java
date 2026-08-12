package com.masoi.room.config;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class InternalRealtimePropertiesTest {
    @Test
    void acceptsTokenAndRedactsToString() {
        var p = new InternalRealtimeProperties("test-token");
        assertThat(p.token()).isEqualTo("test-token");
        assertThat(p.toString()).doesNotContain("test-token");
    }

    @Test
    void rejectsMissingOrBlank() {
        for (String token : new String[]{null, "", " "})
            assertThatThrownBy(() -> new InternalRealtimeProperties(token)).isInstanceOf(IllegalArgumentException.class).hasMessage("app.internal-realtime.token is required");
    }
}
