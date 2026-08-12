export type RoleQuantity = {
  roleId: string
  quantity: number
}

export type PlayGameRequest = {
  hostId: string
  roles: RoleQuantity[]
}

export type PlayGameResponse = {
  roomCode: string
  numberPlayers: number
  gameSessionId: string
  assignments: HostAssignment[]
}

export type ConfirmSetupResponse = { roomCode: string; activeRoles: RoleQuantity[] }

export type HostAssignment = { playerId: string; playerName: string; roleId: string; roleName: string }

export type EndGameRequest = {
  hostId: string
  winningSide: string
}

export type EndGameResponse = {
  roomCode: string
  hostId: string
  message: string
  status?: string
}

export type RoundNote = {
  roundNumber: number
  notesByRole: Record<string, string>
  confirmed: boolean
  confirmedAt?: string
}
