package com.masoi.room.service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;

import org.springframework.stereotype.Service;

@Service
public class PendingPlayerRemovalCoordinator {
    private final ConcurrentHashMap<PlayerKey, PendingRemoval> pending = new ConcurrentHashMap<>();

    public <T> T transition(PlayerKey key, Function<PendingRemoval, Transition<T>> operation) {
        AtomicReference<T> result = new AtomicReference<>();
        pending.compute(key, (ignored, existing) -> {
            Transition<T> transition = operation.apply(existing);
            result.set(transition.result());
            return transition.next();
        });
        return result.get();
    }

    public static Transition<Void> keep(PendingRemoval pending) {
        return new Transition<>(pending, null);
    }

    public static Transition<Void> clear() {
        return new Transition<>(null, null);
    }

    public static void cancel(PendingRemoval pending) {
        if (pending != null) pending.cancellation().cancel();
    }

    public record PlayerKey(String roomCode, String playerId) {
    }

    public record PendingRemoval(String roomCode, String playerId, String sessionId, String token,
                                 PendingPlayerRemovalScheduler.Cancellation cancellation) {
    }

    public record Transition<T>(PendingRemoval next, T result) {
    }
}
