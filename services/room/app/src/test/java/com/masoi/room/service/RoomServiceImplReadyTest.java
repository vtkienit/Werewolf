package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.exception.PlayerCredentialInvalidException;
import com.masoi.room.exception.RoomPlayingException;
import com.masoi.room.model.RoomSnapshot;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.utils.QrUrlFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class RoomServiceImplReadyTest {
    private static final String ROOM = "A7K9Q2";
    private final RoomRepository repository = mock(RoomRepository.class);
    private final RoomLock lock = mock(RoomLock.class);
    private final PlayerAuthStore auth = mock(PlayerAuthStore.class);
    private final ObjectNode root = new ObjectMapper().createObjectNode();
    private RoomServiceImpl service;

    @BeforeEach
    void setUp() {
        root.put("roomCode", ROOM);
        root.put("hostId", "mP5cYgYNGxa2-WPNnTMR1Q");
        root.put("maxPlayers", 6);
        root.put("lifecycle", "WAITING");
        root.putArray("players").addObject().put("playerId", "p1").put("playerName", "Trung").putNull("roleId").put("ready", false);
        when(lock.acquireOrThrow(ROOM)).thenReturn("owner");
        when(repository.read(ROOM)).thenReturn(new RoomSnapshot(root, "mP5cYgYNGxa2-WPNnTMR1Q", 6, 1));
        service = new RoomServiceImpl(() -> "host", () -> ROOM, repository, mock(QrUrlFactory.class), lock,
                mock(UpdateMaxPlayersRoomStore.class), () -> "generated", auth);
    }

    @Test
    void authenticatedPlayerCanToggleOnlyTheirOwnPersistedReadyState() {
        when(auth.matches(ROOM, "p1", "token")).thenReturn(true);
        service.updateReady(ROOM, "p1", "token", true);
        assertThat(root.at("/players/0/ready").asBoolean()).isTrue();
        verify(repository).write(ROOM, root);
        verify(lock).release(ROOM, "owner");
    }

    @Test
    void rejectsWrongPlayerCredentialAndPlayingLifecycle() {
        assertThatThrownBy(() -> service.updateReady(ROOM, "p1", "wrong", true)).isInstanceOf(PlayerCredentialInvalidException.class);
        when(auth.matches(ROOM, "p1", "token")).thenReturn(true);
        root.put("lifecycle", "PLAYING");
        assertThatThrownBy(() -> service.updateReady(ROOM, "p1", "token", true)).isInstanceOf(RoomPlayingException.class);
    }
}
