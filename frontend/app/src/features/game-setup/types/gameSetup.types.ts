export type GameSetupPlayer = {
  playerId: string
  playerName: string
  ready?: boolean
}

export type GameSetupRole = {
  roleId: string
  name: string
  team: string
  recommended?: boolean
  maxQuantity?: number
}

export type RoleQuantityMap = Record<string, number>
