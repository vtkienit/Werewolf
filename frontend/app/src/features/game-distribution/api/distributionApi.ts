import { environment } from "../../../config/environment"
import type {
  EndGameRequest,
  EndGameResponse,
  PlayGameRequest,
  PlayGameResponse,
  ConfirmSetupResponse,
} from "../types/distribution.types"

function parseRoleQuantities(value: unknown): { roleId: string; quantity: number }[] | null {
  if (!Array.isArray(value)) return null
  return value.every(role => role && typeof role === "object" && !Array.isArray(role)
    && Object.keys(role).length === 2 && typeof (role as Record<string, unknown>).roleId === "string"
    && typeof (role as Record<string, unknown>).quantity === "number" && Number.isInteger((role as Record<string, unknown>).quantity)
    && Number((role as Record<string, unknown>).quantity) > 0) ? value as { roleId: string; quantity: number }[] : null
}

function parseConfirmSetupResponse(value: unknown, roomCode: string): ConfirmSetupResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const response = value as Record<string, unknown>
  const activeRoles = parseRoleQuantities(response.activeRoles)
  return Object.keys(response).length === 2 && response.roomCode === roomCode && activeRoles ? { roomCode, activeRoles } : null
}

function parsePlayGameResponse(value: unknown): PlayGameResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const response = value as Record<string, unknown>
  const assignments = response.assignments
  return Object.keys(response).length === 4
    && typeof response.roomCode === "string"
    && response.roomCode.length > 0
    && typeof response.numberPlayers === "number"
    && Number.isInteger(response.numberPlayers)
    && response.numberPlayers >= 0
    && typeof response.gameSessionId === "string"
    && response.gameSessionId.trim() !== ""
    && Array.isArray(assignments)
    && assignments.length === response.numberPlayers
    && assignments.every(item => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false
      const assignment = item as Record<string, unknown>
      return Object.keys(assignment).length === 4 && typeof assignment.playerId === "string" && assignment.playerId !== ""
        && typeof assignment.playerName === "string" && assignment.playerName !== "" && typeof assignment.roleId === "string" && assignment.roleId !== ""
        && typeof assignment.roleName === "string" && assignment.roleName !== ""
    })
    ? response as PlayGameResponse
    : null
}

async function postJson<TResponse, TRequest>(
  path: string,
  body: TRequest,
  parse: (value: unknown) => TResponse | null,
  signal?: AbortSignal,
): Promise<TResponse> {
  const response = await fetch(`${environment.apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) throw new Error("Distribution request failed.")

  const parsed = parse(await response.json() as unknown)
  if (!parsed) throw new Error("Invalid Distribution response.")
  return parsed
}

function parseEndGameResponse(value: unknown, roomCode: string): EndGameResponse | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const response = value as Record<string, unknown>
  const keys = Object.keys(response)
  const exactKeys = keys.length === 3
    ? keys.every(key => key === "roomCode" || key === "hostId" || key === "message")
    : keys.length === 4 && keys.every(key => key === "roomCode" || key === "hostId" || key === "message" || key === "status")
  return exactKeys
    && typeof response.roomCode === "string"
    && response.roomCode.trim() !== ""
    && response.roomCode.trim().toUpperCase() === roomCode.trim().toUpperCase()
    && typeof response.hostId === "string"
    && response.hostId.trim() !== ""
    && typeof response.message === "string"
    && (response.status === undefined || typeof response.status === "string")
    ? response as EndGameResponse
    : null
}

export function startGame(
  roomCode: string,
  request: PlayGameRequest,
  signal?: AbortSignal,
): Promise<PlayGameResponse> {
  return postJson(`/api/distribution/rooms/${roomCode}`, request, value => {
    const response = parsePlayGameResponse(value)
    return response?.roomCode === roomCode ? response : null
  }, signal)
}

export function confirmGameSetup(roomCode: string, request: PlayGameRequest, signal?: AbortSignal): Promise<ConfirmSetupResponse> {
  return postJson(`/api/distribution/rooms/${roomCode}/setup`, request, value => parseConfirmSetupResponse(value, roomCode), signal)
}

export function endGame(
  roomCode: string,
  request: EndGameRequest,
  signal?: AbortSignal,
): Promise<EndGameResponse> {
  return postJson(`/api/distribution/rooms/${roomCode}/end-game`, request, value => parseEndGameResponse(value, roomCode), signal)
}
