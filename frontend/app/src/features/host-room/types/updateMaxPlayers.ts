export type UpdateMaxPlayersResponse = {
  maxPlayers: number
}

export type ApiError = {
  code: string
  message: string
}

export type UpdateMaxPlayersLocalError = ApiError
