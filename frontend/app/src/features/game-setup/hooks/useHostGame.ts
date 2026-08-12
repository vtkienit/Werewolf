import { useEffect, useMemo, useRef, useState } from "react"
import { confirmGameSetup, endGame, startGame } from "../../game-distribution"
import { archiveGameReview, beginGameReviewSession, loadActiveGameReview } from "../../round-note/storage/roundNoteStorage"
import type { HostAssignment } from "../../game-distribution/types/distribution.types"
import type { GameSetupPlayer, GameSetupRole, RoleQuantityMap } from "../types/gameSetup.types"
import { getSelectedRoleTotal, isConfirmedSetupValidForPlayers, isRoleSetupValid, toPlayGameRoles } from "../utils/gameSetupValidation"

export type RoomLifecycle = "WAITING" | "PLAYING"
export type HostGameStatus = "IDLE" | "CONFIRM_REQUEST_PENDING" | "START_REQUEST_PENDING" | "END_REQUEST_PENDING" | "CONFIRM_ERROR" | "START_ERROR" | "END_ERROR"
export type HostGameController = Readonly<{
  quantities: RoleQuantityMap; selectedRoleCount: number; lifecycle: RoomLifecycle; status: HostGameStatus; statusMessage: string
  isRoleSetupValid: boolean; canConfirmRoleSetup: boolean; areAllPlayersReady: boolean; canStart: boolean; setupConfirmed: boolean; pending: boolean; active: boolean
  assignments: readonly HostAssignment[]; gameSessionId: string | null; winnerOptions: readonly string[]; winningSide: string
  updateQuantity: (roleId: string, quantity: number) => void; recommend: () => void; confirmRoleSetup: () => Promise<boolean>; setWinningSide: (side: string) => void; start: () => Promise<boolean>; end: () => Promise<boolean>; reconcileEnded: () => void
}>

function initialQuantities(roles: GameSetupRole[], playerCount: number): RoleQuantityMap {
  const quantities: RoleQuantityMap = Object.fromEntries(roles.map(role => [role.roleId, 0]))
  const defaults = [["werewolf", Math.min(2, playerCount)], ["seer", playerCount >= 3 ? 1 : 0], ["guard", playerCount >= 4 ? 1 : 0]] as const
  for (const [roleId, quantity] of defaults) if (roles.some(role => role.roleId === roleId)) quantities[roleId] = quantity
  const selected = getSelectedRoleTotal(quantities)
  if (roles.some(role => role.roleId === "villager") && selected < playerCount) quantities.villager = playerCount - selected
  return quantities
}

function normalizeQuantity(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
}

export function useHostGame(roomCode: string, hostId: string, players: GameSetupPlayer[], roles: GameSetupRole[], authoritativeLifecycle: RoomLifecycle = "WAITING", authoritativeRoles: readonly { roleId: string; quantity: number }[] = []): HostGameController {
  const restoredQuantities = () => ({ ...Object.fromEntries(roles.map(role => [role.roleId, 0])), ...Object.fromEntries(authoritativeRoles.map(role => [role.roleId, role.quantity])) })
  const [quantities, setQuantities] = useState<RoleQuantityMap>(() => authoritativeRoles.length > 0 ? restoredQuantities() : initialQuantities(roles, players.length))
  const restored = useMemo(() => loadActiveGameReview(roomCode).session, [roomCode])
  const [lifecycle, setLifecycle] = useState<RoomLifecycle>(authoritativeLifecycle)
  const [assignments, setAssignments] = useState<readonly HostAssignment[]>(() => restored?.assignments.map(item => ({ playerId: item.playerId, playerName: item.playerNameSnapshot, roleId: item.roleId, roleName: item.roleNameSnapshot })) ?? [])
  const [gameSessionId, setGameSessionId] = useState<string | null>(() => restored?.gameSessionId ?? null)
  const [winningSide, setWinningSide] = useState("")
  const [confirmedQuantities, setConfirmedQuantities] = useState<RoleQuantityMap | null>(() => authoritativeRoles.length > 0 ? restoredQuantities() : null)
  const [status, setStatus] = useState<HostGameStatus>("IDLE")
  const [statusMessage, setStatusMessage] = useState("")
  const mutation = useRef<AbortController | null>(null); const generation = useRef(0); const mounted = useRef(true)
  const initializedForPlayers = useRef(players.length > 0)
  const setupEdited = useRef(false)
  const gameSessionIdRef = useRef(gameSessionId)
  const winningSideRef = useRef(winningSide)
  const selectedRoleCount = useMemo(() => getSelectedRoleTotal(quantities), [quantities])
  const pending = status === "CONFIRM_REQUEST_PENDING" || status === "START_REQUEST_PENDING" || status === "END_REQUEST_PENDING"
  const active = lifecycle === "PLAYING"
  const roleSetupValid = isRoleSetupValid(roles, quantities)
  const canConfirmRoleSetup = lifecycle === "WAITING" && roleSetupValid && status !== "CONFIRM_REQUEST_PENDING"
  const areAllPlayersReady = players.length >= 6 && players.every(player => player.ready === true)
  const setupConfirmed = confirmedQuantities !== null
  const confirmedSetupValid = confirmedQuantities !== null && isConfirmedSetupValidForPlayers(roles, confirmedQuantities, players.length)
  const canStart = lifecycle === "WAITING" && areAllPlayersReady && confirmedSetupValid && !pending
  const winnerOptions = useMemo(() => [...new Set(assignments.map(assignment => roles.find(role => role.roleId === assignment.roleId)?.team.toUpperCase()).filter((side): side is string => !!side))], [assignments, roles])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; generation.current++; mutation.current?.abort(); mutation.current = null }
  }, [])
  useEffect(() => { setLifecycle(authoritativeLifecycle) }, [authoritativeLifecycle])
  useEffect(() => {
    if (!initializedForPlayers.current && !setupEdited.current && confirmedQuantities === null && players.length > 0 && lifecycle === "WAITING") {
      initializedForPlayers.current = true
      setQuantities(initialQuantities(roles, players.length))
    }
  }, [confirmedQuantities, lifecycle, players.length, roles])
  const hydratedSetup = useRef(authoritativeRoles.length > 0)
  useEffect(() => {
    if (!hydratedSetup.current && authoritativeRoles.length > 0 && lifecycle === "WAITING") {
      hydratedSetup.current = true
      const restored = restoredQuantities()
      setQuantities(restored)
      setConfirmedQuantities(restored)
    }
  }, [authoritativeRoles, lifecycle])

  function reconcileEnded() {
    generation.current++
    mutation.current?.abort()
    mutation.current = null
    if (gameSessionIdRef.current) archiveGameReview(roomCode, gameSessionIdRef.current, winningSideRef.current || "UNKNOWN")
    setLifecycle("WAITING")
    setQuantities(initialQuantities(roles, players.length))
    setConfirmedQuantities(null)
    setStatus("IDLE")
    gameSessionIdRef.current = null; winningSideRef.current = ""
    setAssignments([]); setGameSessionId(null); setWinningSide("")
    setStatusMessage("Game ended. Setup is available again.")
  }
  async function start(): Promise<boolean> {
    if (!canStart || pending || mutation.current) return false
    const request = new AbortController(); const requestGeneration = ++generation.current; mutation.current = request; setStatus("START_REQUEST_PENDING"); setStatusMessage("")
    try {
      const setup = confirmedQuantities ?? quantities
      const response = await startGame(roomCode, { hostId, roles: toPlayGameRoles(roles, setup) }, request.signal)
      if (!mounted.current || generation.current !== requestGeneration) return false
      const responseAssignments = response.assignments ?? players.map((player, index) => {
        const expanded = toPlayGameRoles(roles, setup).flatMap(role => Array.from({ length: role.quantity }, () => role.roleId))
        const roleId = expanded[index] ?? roles[0]?.roleId ?? "unknown"
        return { playerId: player.playerId, playerName: player.playerName, roleId, roleName: roles.find(role => role.roleId === roleId)?.name ?? roleId }
      })
      const responseGameSessionId = response.gameSessionId ?? crypto.randomUUID()
      if (responseAssignments.length > 0) beginGameReviewSession(roomCode, responseGameSessionId, responseAssignments)
      gameSessionIdRef.current = responseGameSessionId; winningSideRef.current = ""
      setAssignments(responseAssignments); setGameSessionId(responseGameSessionId); setWinningSide(""); setLifecycle("PLAYING"); setStatus("IDLE"); setStatusMessage(`Started game for ${response.numberPlayers} players.`); return true
    } catch (error) {
      if (!mounted.current || generation.current !== requestGeneration || request.signal.aborted) return false
      setStatus("START_ERROR"); setStatusMessage(error instanceof Error ? error.message : "Cannot start game."); return false
    } finally { if (generation.current === requestGeneration) mutation.current = null }
  }
  async function end(): Promise<boolean> {
    if (!active || !winningSide || !gameSessionId || pending || mutation.current) return false
    const request = new AbortController(); const requestGeneration = ++generation.current; mutation.current = request; setStatus("END_REQUEST_PENDING"); setStatusMessage("")
    try {
      await endGame(roomCode, { hostId, winningSide }, request.signal)
      if (!mounted.current || generation.current !== requestGeneration) return false
      archiveGameReview(roomCode, gameSessionId, winningSide); reconcileEnded(); return true
    } catch (error) {
      if (!mounted.current || generation.current !== requestGeneration || request.signal.aborted) return false
      setStatus("END_ERROR"); setStatusMessage(error instanceof Error ? error.message : "Cannot end game."); return false
    } finally { if (generation.current === requestGeneration) mutation.current = null }
  }
  return {
    quantities, selectedRoleCount, lifecycle, status, statusMessage, isRoleSetupValid: roleSetupValid, canConfirmRoleSetup, areAllPlayersReady, canStart, setupConfirmed, pending, active,
    assignments, gameSessionId, winnerOptions, winningSide,
    updateQuantity: (roleId, quantity) => { if (!active && !pending) { setupEdited.current = true; setQuantities(current => ({ ...current, [roleId]: normalizeQuantity(quantity) })); setConfirmedQuantities(null) } },
    recommend: () => { if (!active && !pending) { setupEdited.current = true; setQuantities(initialQuantities(roles, players.length)); setConfirmedQuantities(null) } },
    confirmRoleSetup,
    setWinningSide: side => { if (active && !pending && winnerOptions.includes(side)) { winningSideRef.current = side; setWinningSide(side) } }, start, end, reconcileEnded,
  }
  async function confirmRoleSetup(): Promise<boolean> {
    if (!canConfirmRoleSetup || mutation.current) return false
    const request = new AbortController(); const requestGeneration = ++generation.current; mutation.current = request; setStatus("CONFIRM_REQUEST_PENDING"); setStatusMessage("")
    try {
      const response = await confirmGameSetup(roomCode, { hostId, roles: toPlayGameRoles(roles, quantities) }, request.signal)
      if (!mounted.current || generation.current !== requestGeneration) return false
      const confirmed = { ...Object.fromEntries(roles.map(role => [role.roleId, 0])), ...Object.fromEntries(response.activeRoles.map(role => [role.roleId, role.quantity])) }
      hydratedSetup.current = true
      setQuantities(confirmed); setConfirmedQuantities(confirmed); setStatus("IDLE"); setStatusMessage("Role setup confirmed. Players may finish getting ready."); return true
    } catch (error) {
      if (!mounted.current || generation.current !== requestGeneration || request.signal.aborted) return false
      setStatus("CONFIRM_ERROR"); setStatusMessage(error instanceof Error ? error.message : "Cannot confirm role setup."); return false
    } finally { if (generation.current === requestGeneration) mutation.current = null }
  }
}
