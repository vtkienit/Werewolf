export type HostRoomStatus = "loading" | "error" | "waiting" | "in-game"

export type HostRoomPresentationError = Readonly<{
  code: string
  message: string
}>

export type HostRoomPresentation = Readonly<{
  status: HostRoomStatus
  roomCode: string
  joinUrl: string
  error: HostRoomPresentationError | null
  isMockStatus: boolean
}>