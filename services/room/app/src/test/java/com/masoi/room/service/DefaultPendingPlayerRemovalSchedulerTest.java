package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.masoi.room.config.DisconnectGraceProperties;

import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class DefaultPendingPlayerRemovalSchedulerTest {
    private DefaultPendingPlayerRemovalScheduler scheduler;

    @AfterEach
    void closeScheduler() {
        if (scheduler != null) scheduler.shutdown();
    }

    @Test
    void executesOneScheduledActionWithoutUsingTheConfiguredGraceWait() throws Exception {
        scheduler = scheduler(Duration.ofMillis(10));
        CountDownLatch completed = new CountDownLatch(1);

        scheduler.schedule(completed::countDown);

        assertThat(completed.await(1, TimeUnit.SECONDS)).isTrue();
    }

    @Test
    void retainsTheConfiguredGraceDurationWithoutScatteringMilliseconds() {
        scheduler = scheduler(Duration.ofSeconds(10));

        assertThat(scheduler.disconnectGracePeriod()).isEqualTo(Duration.ofSeconds(10));
    }

    @Test
    void cancellationIsBestEffortAndIdempotent() throws Exception {
        scheduler = scheduler(Duration.ofMillis(10));
        CountDownLatch executed = new CountDownLatch(1);
        PendingPlayerRemovalScheduler.Cancellation cancellation = scheduler.schedule(executed::countDown);

        assertThat(cancellation.cancel()).isTrue();
        assertThat(cancellation.cancel()).isFalse();
        assertThat(executed.await(250, TimeUnit.MILLISECONDS)).isFalse();
    }

    @Test
    void cancellationAfterExecutionIsHarmless() throws Exception {
        scheduler = scheduler(Duration.ofMillis(10));
        CountDownLatch completed = new CountDownLatch(1);
        PendingPlayerRemovalScheduler.Cancellation cancellation = scheduler.schedule(completed::countDown);

        assertThat(completed.await(1, TimeUnit.SECONDS)).isTrue();
        assertThat(cancellation.cancel()).isFalse();
    }

    @Test
    void taskFailureDoesNotPreventLaterWork() throws Exception {
        scheduler = scheduler(Duration.ofMillis(10));
        CountDownLatch completed = new CountDownLatch(1);
        scheduler.schedule(() -> {
            throw new IllegalStateException("expected");
        });
        scheduler.schedule(completed::countDown);

        assertThat(completed.await(1, TimeUnit.SECONDS)).isTrue();
    }

    @Test
    void shutdownRejectsNewTasksAndPreventsPendingWork() throws Exception {
        scheduler = scheduler(Duration.ofMillis(10));
        CountDownLatch executed = new CountDownLatch(1);
        scheduler.schedule(executed::countDown);

        scheduler.shutdown();

        assertThatThrownBy(() -> scheduler.schedule(() -> {
        })).isInstanceOf(IllegalStateException.class);
        assertThat(executed.await(250, TimeUnit.MILLISECONDS)).isFalse();
    }

    private DefaultPendingPlayerRemovalScheduler scheduler(Duration grace) {
        return new DefaultPendingPlayerRemovalScheduler(new DisconnectGraceProperties(grace));
    }
}
