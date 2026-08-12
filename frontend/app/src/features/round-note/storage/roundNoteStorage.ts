import { canonicalRoomCode } from "../../../config/playerSessionStorage"
import type { HostAssignment } from "../../game-distribution/types/distribution.types"

export type PlayerRoundNote = Readonly<{ playerId: string; playerNameSnapshot: string; playerDisambiguator: string; roleId: string; roleNameSnapshot: string; text: string }>
export type ConfirmedRound = Readonly<{ roundNumber: number; confirmedAt: string; playerNotes: readonly PlayerRoundNote[]; content?: string }>
export type GameReview = Readonly<{ id: string; roomCode: string; gameSessionId: string; completed: boolean; winningSide?: string; assignments: readonly PlayerRoundNote[]; currentRound: ConfirmedRound; rounds: readonly ConfirmedRound[] }>
type Store = Readonly<{ version: 2; activeSessionId: string | null; sessions: readonly GameReview[] }>

const storageError = "Round Note storage is unavailable."
const emptyStore: Store = { version: 2, activeSessionId: null, sessions: [] }

export function roundNoteStorageKey(roomCode: string): string { const code = canonicalRoomCode(roomCode); return `masoi.host.rooms.${code ?? "INVALID"}.roundNotes.v2` }
function legacyKey(roomCode: string): string { const code = canonicalRoomCode(roomCode); return `masoi.host.rooms.${code ?? "INVALID"}.roundNotes.v1` }

function playerNotes(assignments: readonly HostAssignment[]): PlayerRoundNote[] {
  const counts = new Map<string, number>()
  assignments.forEach(item => counts.set(item.playerName, (counts.get(item.playerName) ?? 0) + 1))
  return assignments.map((item, index) => ({
    playerId: item.playerId,
    playerNameSnapshot: item.playerName,
    playerDisambiguator: (counts.get(item.playerName) ?? 0) > 1 ? `Player ${index + 1}` : "",
    roleId: item.roleId,
    roleNameSnapshot: item.roleName,
    text: "",
  }))
}

function validNote(value: unknown): value is PlayerRoundNote {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return typeof item.playerId === "string" && item.playerId !== "" && typeof item.playerNameSnapshot === "string"
    && typeof item.playerDisambiguator === "string" && typeof item.roleId === "string" && item.roleId !== ""
    && typeof item.roleNameSnapshot === "string" && typeof item.text === "string"
}
function validRound(value: unknown): value is ConfirmedRound {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return Number.isInteger(item.roundNumber) && Number(item.roundNumber) > 0 && typeof item.confirmedAt === "string"
    && Array.isArray(item.playerNotes) && item.playerNotes.every(validNote)
}
function validSession(value: unknown): value is GameReview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return typeof item.id === "string" && item.id === item.gameSessionId && typeof item.roomCode === "string" && typeof item.gameSessionId === "string" && item.gameSessionId !== ""
    && typeof item.completed === "boolean" && (item.winningSide === undefined || typeof item.winningSide === "string")
    && Array.isArray(item.assignments) && item.assignments.every(validNote) && validRound(item.currentRound)
    && Array.isArray(item.rounds) && item.rounds.every(validRound)
}

function readStore(roomCode: string): { store: Store; error: string | null } {
  const code = canonicalRoomCode(roomCode); if (!code) return { store: emptyStore, error: storageError }
  try {
    const raw = localStorage.getItem(roundNoteStorageKey(code))
    if (raw === null) return { store: emptyStore, error: null }
    const value = JSON.parse(raw) as Record<string, unknown>
    if (!value || value.version !== 2 || (value.activeSessionId !== null && typeof value.activeSessionId !== "string") || !Array.isArray(value.sessions) || !value.sessions.every(validSession)) throw new Error("invalid")
    const sessions = value.sessions as GameReview[]
    if (value.activeSessionId !== null && !sessions.some(item => item.gameSessionId === value.activeSessionId && !item.completed)) throw new Error("invalid")
    return { store: { version: 2, activeSessionId: value.activeSessionId as string | null, sessions }, error: null }
  } catch { return { store: emptyStore, error: storageError } }
}
function writeStore(roomCode: string, store: Store): boolean { try { localStorage.setItem(roundNoteStorageKey(roomCode), JSON.stringify(store)); return true } catch { return false } }

export function beginGameReviewSession(roomCode: string, gameSessionId: string, assignments: readonly HostAssignment[]): GameReview | null {
  const code = canonicalRoomCode(roomCode); if (!code || !gameSessionId || assignments.length === 0) return null
  const { store } = readStore(code)
  const existing = store.sessions.find(item => item.gameSessionId === gameSessionId)
  if (existing) return existing
  const notes = playerNotes(assignments)
  const session: GameReview = { id: gameSessionId, roomCode: code, gameSessionId, completed: false, assignments: notes, currentRound: { roundNumber: 1, confirmedAt: "", playerNotes: notes, content: "" }, rounds: [] }
  return writeStore(code, { version: 2, activeSessionId: gameSessionId, sessions: [...store.sessions, session] }) ? session : null
}
export function loadActiveGameReview(roomCode: string): { session: GameReview | null; error: string | null } { const result = readStore(roomCode); return { session: result.store.sessions.find(item => item.gameSessionId === result.store.activeSessionId) ?? null, error: result.error } }
export function loadLatestCompletedGameReview(roomCode: string): GameReview | null { return [...readStore(roomCode).store.sessions].reverse().find(item => item.completed) ?? null }
export function updatePlayerRoundNote(roomCode: string, gameSessionId: string, playerId: string, text: string): GameReview | null {
  const { store } = readStore(roomCode); let updated: GameReview | null = null
  const sessions = store.sessions.map(session => {
    if (session.gameSessionId !== gameSessionId || session.completed) return session
    if (!session.currentRound.playerNotes.some(note => note.playerId === playerId)) return session
    updated = { ...session, currentRound: { ...session.currentRound, playerNotes: session.currentRound.playerNotes.map(note => note.playerId === playerId ? { ...note, text } : note) } }
    return updated
  })
  return updated && writeStore(roomCode, { ...store, sessions }) ? updated : null
}
export function confirmCurrentRound(roomCode: string, gameSessionId: string): GameReview | null {
  const { store } = readStore(roomCode); let updated: GameReview | null = null
  const sessions = store.sessions.map(session => {
    if (session.gameSessionId !== gameSessionId || session.completed) return session
    const confirmed = { ...session.currentRound, confirmedAt: new Date().toISOString() }
    const nextNotes = session.assignments.map(note => ({ ...note, text: "" }))
    updated = { ...session, rounds: [...session.rounds, confirmed], currentRound: { roundNumber: confirmed.roundNumber + 1, confirmedAt: "", playerNotes: nextNotes } }
    return updated
  })
  return updated && writeStore(roomCode, { ...store, sessions }) ? updated : null
}
export function archiveGameReview(roomCode: string, gameSessionId: string, winningSide: string): boolean {
  const { store } = readStore(roomCode); let found = false
  const sessions = store.sessions.map(session => {
    if (session.gameSessionId !== gameSessionId || session.completed) return session
    found = true
    const hasDraft = session.currentRound.playerNotes.some(note => note.text !== "")
    const rounds = hasDraft ? [...session.rounds, { ...session.currentRound, confirmedAt: new Date().toISOString() }] : session.rounds
    return { ...session, completed: true, winningSide, rounds }
  })
  return found && writeStore(roomCode, { version: 2, activeSessionId: null, sessions })
}

// Compatibility exports used by the previous aggregate-note UI and migration tests.
export type RoundNote = Readonly<{ roundNumber: number; content: string }>
export type RoundNoteSession = GameReview
export function loadActiveRoundNoteSession(roomCode: string) { return loadActiveGameReview(roomCode) }
export function loadCompletedRoundNoteSessions(roomCode: string) { return readStore(roomCode).store.sessions.filter(item => item.completed) }
export function beginRoundNoteSession(roomCode: string): GameReview | null { return beginGameReviewSession(roomCode, crypto.randomUUID(), [{ playerId: "legacy", playerName: "Round notes", roleId: "legacy", roleName: "Legacy" }]) }
export function saveRoundNote(roomCode: string, sessionId: string, _roundNumber: number, content: string): boolean {
  const session = readStore(roomCode).store.sessions.find(item => item.gameSessionId === sessionId)
  const playerId = session?.currentRound.playerNotes[0]?.playerId
  return !!playerId && updatePlayerRoundNote(roomCode, sessionId, playerId, content) !== null
}
export function addRoundNote(roomCode: string, sessionId: string): GameReview | null { return confirmCurrentRound(roomCode, sessionId) }
export function finalizeRoundNoteSession(roomCode: string): boolean { const active = loadActiveGameReview(roomCode).session; return active ? archiveGameReview(roomCode, active.gameSessionId, active.winningSide ?? "UNKNOWN") : true }
export function legacyRoundNoteStorageKey(roomCode: string): string { return legacyKey(roomCode) }
