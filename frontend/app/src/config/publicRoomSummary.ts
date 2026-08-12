import { characters } from "../data/characters"
import type { PublicCompletedGameSummary, PublicRoleSummary } from "./playerLobbyTypes"

const roleIds = new Set(characters.map(character => character.id))
const winningSides = new Set(["VILLAGE", "WEREWOLF", "VAMPIRE", "OTHER"])

export function parsePublicRoles(value: unknown): PublicRoleSummary[] {
  if (!Array.isArray(value)) return []
  const totals = new Map<string, number>()
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const role = item as Record<string, unknown>
    if (Object.keys(role).length !== 2 || typeof role.roleId !== "string" || !roleIds.has(role.roleId)
      || typeof role.quantity !== "number" || !Number.isInteger(role.quantity) || role.quantity <= 0) continue
    totals.set(role.roleId, (totals.get(role.roleId) ?? 0) + role.quantity)
  }
  return [...totals.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([roleId, quantity]) => ({ roleId, quantity }))
}

export function parsePublicCompletedGame(value: unknown): PublicCompletedGameSummary | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const summary = value as Record<string, unknown>
  if (Object.keys(summary).length !== 2 || typeof summary.winningSide !== "string" || !winningSides.has(summary.winningSide)) return null
  const roles = parsePublicRoles(summary.roles)
  return roles.length > 0 ? { winningSide: summary.winningSide, roles } : null
}
