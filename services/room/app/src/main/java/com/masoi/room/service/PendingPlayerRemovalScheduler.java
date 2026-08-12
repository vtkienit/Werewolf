package com.masoi.room.service;

public interface PendingPlayerRemovalScheduler {
    Cancellation schedule(Runnable action);

    void shutdown();

    interface Cancellation {
        boolean cancel();
    }
}
