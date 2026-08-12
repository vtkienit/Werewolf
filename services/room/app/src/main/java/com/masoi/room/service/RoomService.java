package com.masoi.room.service;

import com.masoi.room.dto.response.CreateRoomResponse;
import com.masoi.room.dto.response.UpdateMaxPlayersResponse;
import com.masoi.room.dto.request.JoinRoomRequest;
import com.masoi.room.dto.response.JoinRoomResponse;

public interface RoomService {
    CreateRoomResponse createRoom();

    UpdateMaxPlayersResponse updateMaxPlayers(String roomCode, String hostId, int maxPlayers);

    JoinRoomResponse joinRoom(String roomCode, JoinRoomRequest request);

    void updateReady(String roomCode, String playerId, String playerToken, boolean ready);
}
