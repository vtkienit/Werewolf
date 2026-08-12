import { environment } from "../../../config/environment"
import type { ApiError, UpdateMaxPlayersResponse } from "../types/updateMaxPlayers"

export class UpdateMaxPlayersClientError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = "UpdateMaxPlayersClientError"
  }
}

function isExactRecord(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new UpdateMaxPlayersClientError("INVALID_RESPONSE", "Invalid JSON from Update Max Players API")
  }
}

function parseSuccess(value: unknown): UpdateMaxPlayersResponse {
  if (!isExactRecord(value, ["maxPlayers"])
    || typeof value.maxPlayers !== "number"
    || !Number.isInteger(value.maxPlayers)
    || value.maxPlayers < 6
    || value.maxPlayers > 12) {
    throw new UpdateMaxPlayersClientError("INVALID_RESPONSE", "Invalid Update Max Players response")
  }
  return { maxPlayers: value.maxPlayers }
}

function parseError(value: unknown): ApiError {
  if (!isExactRecord(value, ["code", "message"]) || typeof value.code !== "string" || typeof value.message !== "string") {
    throw new UpdateMaxPlayersClientError("INVALID_RESPONSE", "Invalid Update Max Players error response")
  }
  return { code: value.code, message: value.message }
}

export async function updateMaxPlayers(roomCode: string, hostId: string, maxPlayers: number): Promise<UpdateMaxPlayersResponse> {
  let response: Response
  try {
    response = await fetch(`${environment.apiUrl}/api/rooms/${encodeURIComponent(roomCode)}/max-players`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Host-Id": hostId,
      },
      body: JSON.stringify({ maxPlayers }),
    })
  } catch {
    throw new UpdateMaxPlayersClientError("NETWORK_ERROR", "Unable to connect to the server")
  }
  const body = parseJson(await response.text())
  if (response.ok) {
    return parseSuccess(body)
  }
  const error = parseError(body)
  throw new UpdateMaxPlayersClientError(error.code, error.message)
}
