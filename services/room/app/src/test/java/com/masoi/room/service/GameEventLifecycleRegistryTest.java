package com.masoi.room.service;

import static org.assertj.core.api.Assertions.*;

import com.masoi.room.exception.GameEventConflictException;
import com.masoi.room.model.RoleId;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;

class GameEventLifecycleRegistryTest {
    private final GameEventLifecycleRegistry registry = new GameEventLifecycleRegistry();

    @Test
    void startIsIdempotentAndAllowsAnotherPlayer() {
        AtomicInteger publications = new AtomicInteger();
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, publications::incrementAndGet);
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, publications::incrementAndGet);
        registry.start("ABC234", "game-001", "p2", "Lan", RoleId.SEER, publications::incrementAndGet);
        assertThat(publications).hasValue(2);
    }

    @Test
    void conflictingRoleOrActiveGameIsRejectedSafely() {
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        });
        assertConflict(() -> registry.start("ABC234", "game-001", "p1", "Kien", RoleId.SEER, () -> {
        }));
        assertConflict(() -> registry.start("ABC234", "game-002", "p2", "Lan", RoleId.SEER, () -> {
        }));
    }

    @Test
    void endIsIdempotentClearsAssignmentsAndProtectsNewGame() {
        AtomicInteger publications = new AtomicInteger();
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        });
        registry.end("ABC234", "game-001", publications::incrementAndGet);
        registry.end("ABC234", "game-001", publications::incrementAndGet);
        assertThat(publications).hasValue(1);
        assertThat(registry.replay("ABC234", "p1")).isInstanceOf(GameEventLifecycleRegistry.EndReplay.class);
        assertConflict(() -> registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        }));
        registry.start("ABC234", "game-002", "p1", "Kien", RoleId.SEER, () -> {
        });
        assertConflict(() -> registry.end("ABC234", "game-001", () -> {
        }));
    }

    @Test
    void endBeforeStartConflicts() {
        assertConflict(() -> registry.end("ABC234", "game-001", () -> {
        }));
    }

    @Test
    void failedStartPublicationDoesNotCommitAndRetrySucceeds() {
        assertThatThrownBy(() -> registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF,
                () -> {
                    throw new IllegalStateException("publish");
                })).isInstanceOf(IllegalStateException.class);
        assertThat(registry.replay("ABC234", "p1")).isNull();
        AtomicInteger publications = new AtomicInteger();
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, publications::incrementAndGet);
        assertThat(publications).hasValue(1);
    }

    @Test
    void failedEndPublicationKeepsAssignmentsAndRetrySucceeds() {
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        });
        assertThatThrownBy(() -> registry.end("ABC234", "game-001", () -> {
            throw new IllegalStateException("publish");
        }))
                .isInstanceOf(IllegalStateException.class);
        assertThat(registry.replay("ABC234", "p1")).isInstanceOf(GameEventLifecycleRegistry.StartReplay.class);
        registry.end("ABC234", "game-001", () -> {
        });
        assertThat(registry.replay("ABC234", "p1")).isInstanceOf(GameEventLifecycleRegistry.EndReplay.class);
    }

    @Test
    void replayDistinguishesAssignedUnassignedEndedAndUnknownRooms() {
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        });
        assertThat(registry.replay("ABC234", "p1")).isInstanceOf(GameEventLifecycleRegistry.StartReplay.class);
        assertThat(registry.replay("ABC234", "p2")).isNull();
        assertThat(registry.replay("XYZ789", "p1")).isNull();
        registry.end("ABC234", "game-001", () -> {
        });
        assertThat(registry.replay("ABC234", "p2")).isEqualTo(new GameEventLifecycleRegistry.EndReplay("game-001"));
    }

    @Test
    void roomsRemainIsolated() {
        registry.start("ABC234", "game-001", "p1", "Kien", RoleId.WEREWOLF, () -> {
        });
        registry.start("XYZ789", "game-002", "p1", "Kien", RoleId.SEER, () -> {
        });
        registry.end("ABC234", "game-001", () -> {
        });
        assertThat(registry.replay("ABC234", "p1")).isInstanceOf(GameEventLifecycleRegistry.EndReplay.class);
        assertThat(registry.replay("XYZ789", "p1")).isInstanceOf(GameEventLifecycleRegistry.StartReplay.class);
    }

    private static void assertConflict(Runnable transition) {
        assertThatThrownBy(transition::run)
                .isInstanceOf(GameEventConflictException.class)
                .hasMessage("Game event conflicts with the current lifecycle")
                .hasMessageNotContaining("game-001").hasMessageNotContaining("werewolf").hasMessageNotContaining("Kien");
    }
}
