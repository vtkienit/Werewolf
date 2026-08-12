export type PublicPlayer = Readonly<{ playerId: string; playerName: string; isConnected: boolean; ready?: boolean }>
export type PublicRoleSummary = Readonly<{ roleId: string; quantity: number }>
export type PublicCompletedGameSummary = Readonly<{ winningSide: string; roles: readonly PublicRoleSummary[] }>
export type PlayerListSnapshot = Readonly<{ roomCode: string; status: "WAITING" | "PLAYING"; currentPlayers: number; maxPlayers: number; players: readonly PublicPlayer[]; activeRoles?: readonly PublicRoleSummary[]; lastCompletedGame?: PublicCompletedGameSummary | null }>
export type PlayerSession = Readonly<{ roomCode: string; playerId: string; playerName: string; playerToken: string }>
export type PlayerListProps = Readonly<{ players: readonly PublicPlayer[]; maxPlayers: number; currentPlayerId?: string }>
