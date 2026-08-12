package com.masoi.room.repository;

import com.masoi.room.model.SaveRoomResult;
import com.masoi.room.model.Room;
import com.masoi.room.model.RoomSnapshot;
import tools.jackson.databind.node.ObjectNode;

public interface RoomRepository {
    SaveRoomResult saveIfAbsent(Room room);

    RoomSnapshot read(String roomCode);

    void write(String roomCode, ObjectNode root);
}
