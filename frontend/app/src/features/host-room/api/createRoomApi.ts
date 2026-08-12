import { environment } from "../../../config/environment"
import type { CreateRoomError, CreateRoomResponse } from "../types/createRoom"

export class CreateRoomClientError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = "CreateRoomClientError"
  }
}

function isExactRecord(value: unknown, keys: string[]): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key))
}

function parseJson(text: string): unknown {
  try { return JSON.parse(text) as unknown } catch { throw new CreateRoomClientError("INVALID_RESPONSE", "Invalid JSON from Create Room API") }
}

function parseSuccess(value: unknown): CreateRoomResponse {
  if (!isExactRecord(value, ["roomCode", "hostId", "qrUrl"]) || typeof value.roomCode !== "string" || typeof value.hostId !== "string" || typeof value.qrUrl !== "string") throw new CreateRoomClientError("INVALID_RESPONSE", "Invalid Create Room response")
  return { roomCode: value.roomCode, hostId: value.hostId, qrUrl: value.qrUrl }
}

function parseError(value: unknown): CreateRoomError {
  if (!isExactRecord(value, ["code", "message"]) || typeof value.code !== "string" || typeof value.message !== "string") throw new CreateRoomClientError("INVALID_RESPONSE", "Invalid Create Room error response")
  return { code: value.code, message: value.message }
}

export async function createRoom(): Promise<CreateRoomResponse> {
  let response: Response
  try {
    response = await fetch(`${environment.apiUrl}/api/rooms`, { method: "POST", headers: { Accept: "application/json" } })
  } catch {
    throw new CreateRoomClientError("NETWORK_ERROR", "Unable to connect to the server")
  }
  const body = parseJson(await response.text())
  if (response.ok) return parseSuccess(body)
  const error = parseError(body)
  throw new CreateRoomClientError(error.code, error.message)
}
