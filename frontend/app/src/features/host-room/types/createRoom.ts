export type CreateRoomResponse = {
  roomCode: string
  hostId: string
  qrUrl: string
}

export type CreateRoomError = {
  code: string
  message: string
}
