package com.masoi.room.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.internal-realtime")
public record InternalRealtimeProperties(String token) {
    public InternalRealtimeProperties {
        if (token == null || token.isBlank())
            throw new IllegalArgumentException("app.internal-realtime.token is required");
    }

    @Override
    public String toString() {
        return "InternalRealtimeProperties[token=REDACTED]";
    }
}
