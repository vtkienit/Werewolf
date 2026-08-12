const encodeRoomCode = (roomCode: string) => encodeURIComponent(roomCode)

export const routePaths = {
  home: "/",
  hostCreate: "/host/create",
  hostRoom: (roomCode: string) => `/host/rooms/${encodeRoomCode(roomCode)}`,
  hostSetup: (roomCode: string) => `/host/rooms/${encodeRoomCode(roomCode)}/setup`,
  hostRoundNote: (roomCode: string) => `/host/rooms/${encodeRoomCode(roomCode)}/round-note`,
  joinRoom: (roomCode: string) => `/join/${encodeRoomCode(roomCode)}`,
  playerWaiting: (roomCode: string) => `/player/${encodeRoomCode(roomCode)}`,
  playerCard: (roomCode: string) => `/player/${encodeRoomCode(roomCode)}/card`,
} as const
