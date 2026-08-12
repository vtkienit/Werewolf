package com.masoi.room.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.room-lock")
public record RoomLockProperties(Duration acquisitionTimeout, Duration leaseDuration, Duration retryInterval) {
    public RoomLockProperties {
        if (acquisitionTimeout == null || acquisitionTimeout.isNegative() || acquisitionTimeout.isZero()) {
            throw new IllegalArgumentException("app.room-lock.acquisition-timeout must be a positive duration");
        }
        if (leaseDuration == null || leaseDuration.isNegative() || leaseDuration.isZero()) {
            throw new IllegalArgumentException("app.room-lock.lease-duration must be a positive duration");
        }
        if (retryInterval == null || retryInterval.isNegative() || retryInterval.isZero()) {
            throw new IllegalArgumentException("app.room-lock.retry-interval must be a positive duration");
        }
    }
}
