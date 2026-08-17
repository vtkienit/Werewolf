package com.masoi.room.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.masoi.room.utils.HostIdGenerator;
import com.masoi.room.utils.RoomCodeGenerator;
import com.masoi.room.utils.QrUrlFactory;
import com.masoi.room.model.Room;
import com.masoi.room.exception.RoomCodeGenerationExhaustedException;
import com.masoi.room.exception.RoomStorageUnavailableException;
import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.repository.UpdateMaxPlayersRoomStore;
import com.masoi.room.repository.PlayerAuthStore;
import com.masoi.room.utils.PlayerIdGenerator;
import com.masoi.room.utils.RoomLock;
import com.masoi.room.repository.RoomRepository;
import com.masoi.room.model.SaveRoomResult;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class RoomServiceImplCreateRoomTest {
    private final HostIdGenerator hosts = mock(HostIdGenerator.class);
    private final RoomCodeGenerator codes = mock(RoomCodeGenerator.class);
    private final RoomRepository repository = mock(RoomRepository.class);
    private final QrUrlFactory qr = mock(QrUrlFactory.class);
    private final RoomLock lock = mock(RoomLock.class);
    private final UpdateMaxPlayersRoomStore store = mock(UpdateMaxPlayersRoomStore.class);
    private final RoomServiceImpl service = new RoomServiceImpl(hosts, codes, repository, qr, lock, store,
            mock(PlayerIdGenerator.class), mock(PlayerAuthStore.class));

    @Test
    void firstAttemptPersistsBeforeQrAndReturns() {
        when(hosts.generate()).thenReturn("host");
        when(codes.generate()).thenReturn("A7K9Q2");
        when(repository.saveIfAbsent(org.mockito.ArgumentMatchers.any())).thenReturn(SaveRoomResult.SAVED);
        when(qr.create("A7K9Q2")).thenReturn("http://localhost/join/A7K9Q2");

        assertThat(service.createRoom()).isEqualTo(new CreateRoomResponse("A7K9Q2", "host", "http://localhost/join/A7K9Q2"));
        var order = inOrder(repository, qr);
        order.verify(repository).saveIfAbsent(org.mockito.ArgumentMatchers.any());
        order.verify(qr).create("A7K9Q2");
        verify(hosts).generate();
    }

    @Test
    void collisionGeneratesNewCodeButOnlyOneHost() {
        when(hosts.generate()).thenReturn("one-host");
        when(codes.generate()).thenReturn("AAAAAA", "BBBBBB");
        when(repository.saveIfAbsent(org.mockito.ArgumentMatchers.any())).thenReturn(SaveRoomResult.COLLISION, SaveRoomResult.SAVED);
        when(qr.create("BBBBBB")).thenReturn("http://localhost/join/BBBBBB");

        service.createRoom();
        verify(hosts, times(1)).generate();
        verify(codes, times(2)).generate();
        ArgumentCaptor<Room> rooms = ArgumentCaptor.forClass(Room.class);
        verify(repository, times(2)).saveIfAbsent(rooms.capture());
        assertThat(rooms.getAllValues()).extracting(Room::roomCode).containsExactly("AAAAAA", "BBBBBB");
        assertThat(rooms.getAllValues()).extracting(Room::hostId).containsOnly("one-host");
    }

    @Test
    void exactlyFiveCollisionsExhaustWithoutSixthCallOrQr() {
        when(hosts.generate()).thenReturn("host");
        when(codes.generate()).thenReturn("AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE");
        when(repository.saveIfAbsent(org.mockito.ArgumentMatchers.any())).thenReturn(SaveRoomResult.COLLISION);
        assertThatThrownBy(service::createRoom).isInstanceOf(RoomCodeGenerationExhaustedException.class);
        verify(repository, times(5)).saveIfAbsent(org.mockito.ArgumentMatchers.any());
        verify(codes, times(5)).generate();
        verify(qr, never()).create(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void storageFailureIsNotRetriedAndNeverCreatesQr() {
        when(hosts.generate()).thenReturn("host");
        when(codes.generate()).thenReturn("AAAAAA");
        when(repository.saveIfAbsent(org.mockito.ArgumentMatchers.any())).thenThrow(new RoomStorageUnavailableException(null));
        assertThatThrownBy(service::createRoom).isInstanceOf(RoomStorageUnavailableException.class);
        verify(repository).saveIfAbsent(org.mockito.ArgumentMatchers.any());
        verify(codes).generate();
        verify(qr, never()).create(org.mockito.ArgumentMatchers.anyString());
    }
}
