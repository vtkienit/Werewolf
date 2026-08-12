package com.masoi.room.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.lobby")
public record DisconnectGraceProperties(Duration disconnectGracePeriod) {
    public DisconnectGraceProperties {
        if (disconnectGracePeriod == null || disconnectGracePeriod.isNegative() || disconnectGracePeriod.isZero()) {
            throw new IllegalArgumentException("app.lobby.disconnect-grace-period must be a positive duration");
        }
    }
}
