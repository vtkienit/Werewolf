import { environment } from "./environment"
import type { PlayerSession } from "../config/playerLobbyTypes"
export class JoinClientError extends Error { readonly code: string; constructor(code: string, message: string) { super(message); this.code = code } }
function parse(value: unknown): Omit<PlayerSession, "roomCode"> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new JoinClientError("INVALID_RESPONSE", "Invalid Join response")
  const record = value as Record<string, unknown>; if (Object.keys(record).length !== 3 || typeof record.playerId !== "string" || typeof record.playerName !== "string" || typeof record.playerToken !== "string" || !record.playerId.trim() || !record.playerName.trim() || !record.playerToken.trim()) throw new JoinClientError("INVALID_RESPONSE", "Invalid Join response")
  return { playerId: record.playerId, playerName: record.playerName, playerToken: record.playerToken }
}
export async function joinRoom(roomCode: string, playerName: string): Promise<Omit<PlayerSession, "roomCode">> {
  let response: Response; try { response = await fetch(`${environment.apiUrl}/api/rooms/${roomCode}/players`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerName }) }) } catch { throw new JoinClientError("NETWORK_ERROR", "Unable to connect to the server") }
  const text = await response.text(); let value: unknown; try { value = JSON.parse(text) } catch { throw new JoinClientError("INVALID_RESPONSE", "Invalid Join response") }
  if (response.ok) return parse(value)
  if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).code === "string" && typeof (value as Record<string, unknown>).message === "string") throw new JoinClientError((value as Record<string, string>).code, (value as Record<string, string>).message)
  throw new JoinClientError("INVALID_RESPONSE", "Invalid Join error")
}

