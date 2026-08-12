import type { PlayerSession } from "./playerLobbyTypes"

const roomCodePattern = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/
export function canonicalRoomCode(value: string): string | null { const code = value.trim().toUpperCase(); return roomCodePattern.test(code) ? code : null }
export function playerSessionKey(roomCode: string): string { return `masoi.player.rooms.${roomCode}.session` }
function valid(value: unknown, roomCode: string): value is PlayerSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).length === 4 && record.roomCode === roomCode && typeof record.playerId === "string" && record.playerId.trim() !== "" && typeof record.playerName === "string" && record.playerName.trim() !== "" && typeof record.playerToken === "string" && record.playerToken.trim() !== ""
}
export function storePlayerSession(session: PlayerSession): boolean {
  const roomCode = canonicalRoomCode(session.roomCode); if (!roomCode || !valid({ ...session, roomCode }, roomCode)) return false
  sessionStorage.setItem(playerSessionKey(roomCode), JSON.stringify({ ...session, roomCode })); return true
}
export function loadPlayerSession(roomCode: string): PlayerSession | null {
  const canonical = canonicalRoomCode(roomCode); if (!canonical) return null
  const key = playerSessionKey(canonical); const raw = sessionStorage.getItem(key); if (!raw) return null
  try { const value: unknown = JSON.parse(raw); if (valid(value, canonical)) return value; } catch { }
  sessionStorage.removeItem(key); return null
}
export function clearPlayerSession(roomCode: string): void { const canonical = canonicalRoomCode(roomCode); if (canonical) sessionStorage.removeItem(playerSessionKey(canonical)) }

