import { characters } from "../data/characters"
import type { PublicRoleSummary } from "./playerLobbyTypes"
import { parsePublicCompletedGame } from "./publicRoomSummary"

declare const roleIdBrand: unique symbol
export type RoleId = string & { readonly [roleIdBrand]: true }
export type StartGameEvent = Readonly<{ gameId: string; playerName: string; roleId: RoleId }>
export type EndGameEvent = Readonly<{ gameId: string; winningSide?: string; roles?: readonly PublicRoleSummary[] }>

export const approvedRoleIds: readonly string[] = Object.freeze([...new Set(characters.map(character => character.id))])

export function isRoleId(value: unknown, roleIds: readonly string[] = approvedRoleIds): value is RoleId {
  return typeof value === "string" && roleIds.includes(value)
}

function object(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return null
  return value as Record<string, unknown>
}

function input(value: unknown): unknown {
  if (typeof value !== "string") return value
  try { return JSON.parse(value) as unknown } catch { return null }
}

export function parseStartGameEvent(value: unknown): StartGameEvent | null {
  const record = object(input(value))
  if (!record || Object.keys(record).length !== 3 || typeof record.gameId !== "string" || record.gameId.trim() === "" || typeof record.playerName !== "string" || record.playerName.trim() === "" || !isRoleId(record.roleId)) return null
  return { gameId: record.gameId, playerName: record.playerName, roleId: record.roleId }
}

export function parseEndGameEvent(value: unknown): EndGameEvent | null {
  const record = object(input(value))
  if (!record || typeof record.gameId !== "string" || record.gameId.trim() === "") return null
  const keys = Object.keys(record)
  if (keys.length === 1 && keys[0] === "gameId") return { gameId: record.gameId }
  if (keys.length !== 3 || !keys.every(key => key === "gameId" || key === "winningSide" || key === "roles")) return null
  const summary = parsePublicCompletedGame({ winningSide: record.winningSide, roles: record.roles })
  return summary ? { gameId: record.gameId, ...summary } : null
}
