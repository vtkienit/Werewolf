package com.masoi.room.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.config.RoomLockProperties;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.exception.RoomUpdateBusyException;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;

class RedisRoomLockTest {
    private static final Duration ACQUISITION_TIMEOUT = Duration.ofMillis(3);
    private static final Duration LEASE_DURATION = Duration.ofSeconds(10);
    private static final Duration RETRY_INTERVAL = Duration.ofMillis(1);
    private static final String OWNER_TOKEN = "owner-token";
    private static final String LOCK_KEY = "lock:room:A7K9Q2";

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final LockOwnerTokenGenerator tokenGenerator = mock(LockOwnerTokenGenerator.class);
    private final RoomLockProperties properties = new RoomLockProperties(ACQUISITION_TIMEOUT, LEASE_DURATION, RETRY_INTERVAL);
    private RedisRoomLock lock;

    @BeforeEach
    void setUp() {
        when(redis.opsForValue()).thenReturn(values);
        when(tokenGenerator.generate()).thenReturn(OWNER_TOKEN);
        lock = new RedisRoomLock(redis, tokenGenerator, properties);
    }

    @Test
    void acquireUsesSetNxPxWithLeaseAndUniqueOwnerToken() {
        when(values.setIfAbsent(eq(LOCK_KEY), eq(OWNER_TOKEN), eq(LEASE_DURATION))).thenReturn(true);
        assertThat(lock.acquireOrThrow("A7K9Q2")).isEqualTo(OWNER_TOKEN);
        verify(tokenGenerator).generate();
        verify(values).setIfAbsent(eq(LOCK_KEY), eq(OWNER_TOKEN), eq(LEASE_DURATION));
    }

    @Test
    void acquireRetriesUntilAcquiredWithinTimeout() {
        when(values.setIfAbsent(eq(LOCK_KEY), eq(OWNER_TOKEN), eq(LEASE_DURATION))).thenReturn(false, true);
        assertThat(lock.acquireOrThrow("A7K9Q2")).isEqualTo(OWNER_TOKEN);
        verify(values, atLeastOnce()).setIfAbsent(eq(LOCK_KEY), eq(OWNER_TOKEN), eq(LEASE_DURATION));
    }

    @Test
    void acquireTimesOutWithBoundedWait() {
        when(values.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);
        long start = System.nanoTime();
        assertThatThrownBy(() -> lock.acquireOrThrow("A7K9Q2")).isInstanceOf(RoomUpdateBusyException.class);
        long elapsedMillis = (System.nanoTime() - start) / 1_000_000L;
        assertThat(elapsedMillis).isLessThan(1000L);
    }

    @Test
    void acquireMapsRedisFailureToStorageUnavailable() {
        when(values.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenThrow(new IllegalStateException("redis down"));
        assertThatThrownBy(() -> lock.acquireOrThrow("A7K9Q2")).isInstanceOf(RoomStorageUnavailableException.class);
    }

    @Test
    void nullAcquireResultIsImmediateStorageFailureWithoutRetry() {
        when(values.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(null);
        assertThatThrownBy(() -> lock.acquireOrThrow("A7K9Q2")).isInstanceOf(RoomStorageUnavailableException.class);
        verify(values).setIfAbsent(LOCK_KEY, OWNER_TOKEN, LEASE_DURATION);
    }

    @Test
    void interruptedWaitRestoresInterruptFlagAndStopsAcquisition() {
        when(values.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);
        Thread.currentThread().interrupt();
        try {
            assertThatThrownBy(() -> lock.acquireOrThrow("A7K9Q2")).isInstanceOf(RoomUpdateBusyException.class);
            assertThat(Thread.currentThread().isInterrupted()).isTrue();
        } finally {
            Thread.interrupted();
        }
        verify(values).setIfAbsent(LOCK_KEY, OWNER_TOKEN, LEASE_DURATION);
    }

    @Test
    void releaseRunsLuaCompareAndDeleteAndNeverIssuesUnconditionalDelete() {
        lock.release("A7K9Q2", OWNER_TOKEN);
        verify(redis).execute(any(RedisScript.class), eq(List.of(LOCK_KEY)), eq(OWNER_TOKEN));
        verify(redis, never()).delete(anyString());
        verify(redis, never()).unlink(anyString());
    }

    @Test
    void releaseFailureIsBestEffortWithoutUnconditionalDelete() {
        when(redis.execute(any(RedisScript.class), anyList(), any())).thenThrow(new IllegalStateException("release failed"));
        assertThatCode(() -> lock.release("A7K9Q2", OWNER_TOKEN)).doesNotThrowAnyException();
        verify(redis, never()).delete(anyString());
        verify(redis, never()).unlink(anyString());
    }

    @Test
    void nullReleaseResultIsAcceptedWithoutUnsafeFallback() {
        when(redis.execute(any(RedisScript.class), anyList(), any())).thenReturn(null);
        assertThatCode(() -> lock.release("A7K9Q2", OWNER_TOKEN)).doesNotThrowAnyException();
        verify(redis, never()).delete(anyString());
        verify(redis, never()).unlink(anyString());
    }
}
