package com.masoi.room.service;

import com.masoi.room.config.DisconnectGraceProperties;
import jakarta.annotation.PreDestroy;

import java.time.Duration;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DefaultPendingPlayerRemovalScheduler implements PendingPlayerRemovalScheduler {
    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultPendingPlayerRemovalScheduler.class);
    private final ScheduledThreadPoolExecutor executor;
    private final Duration disconnectGracePeriod;
    private final AtomicBoolean shutdown = new AtomicBoolean();

    public DefaultPendingPlayerRemovalScheduler(DisconnectGraceProperties properties) {
        this.disconnectGracePeriod = properties.disconnectGracePeriod();
        this.executor = new ScheduledThreadPoolExecutor(1, threadFactory());
        this.executor.setRemoveOnCancelPolicy(true);
        this.executor.setExecuteExistingDelayedTasksAfterShutdownPolicy(false);
    }

    @Override
    public Cancellation schedule(Runnable action) {
        if (action == null) {
            throw new IllegalArgumentException("action must be present");
        }
        if (shutdown.get()) {
            throw new IllegalStateException("Pending player removal scheduler is shut down");
        }
        ScheduledFuture<?> future;
        try {
            future = executor.schedule(() -> {
                if (shutdown.get()) return;
                try {
                    action.run();
                } catch (RuntimeException exception) {
                    LOGGER.error("Pending player removal task failed");
                }
            }, disconnectGracePeriod.toNanos(), TimeUnit.NANOSECONDS);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Pending player removal scheduler is unavailable", exception);
        }
        return () -> future.cancel(false);
    }

    public Duration disconnectGracePeriod() {
        return disconnectGracePeriod;
    }

    @Override
    @PreDestroy
    public void shutdown() {
        if (shutdown.compareAndSet(false, true)) {
            executor.shutdownNow();
        }
    }

    private static ThreadFactory threadFactory() {
        return runnable -> {
            Thread thread = new Thread(runnable, "room-lobby-pending-removal");
            thread.setDaemon(true);
            return thread;
        };
    }
}
