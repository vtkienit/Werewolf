import { useEffect, useMemo, useRef, useState } from "react"
import type { Client } from "@stomp/stompjs"
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import type { PlayerListSnapshot } from "../../../config/playerLobbyTypes"
import { canonicalRoomCode } from "../../../config/playerSessionStorage"
import { characters } from "../../../data/characters"
import { useHostGame } from "../../game-setup/hooks/useHostGame"
import type { HostGameController } from "../../game-setup/hooks/useHostGame"
import type { GameSetupPlayer, GameSetupRole } from "../../game-setup/types/gameSetup.types"
import HostRoomShell from "../components/HostRoomShell"
import { HOST_CREDENTIAL_UNAVAILABLE_MESSAGE, useUpdateMaxPlayers } from "../hooks/useUpdateMaxPlayers"
import { createHostRoomClient, deactivateHostRoomClient } from "../realtime/hostRoomSocket"
import { getHostCredential } from "../storage/hostCredentialStorage"
import { createJoinUrl } from "../utils/createJoinUrl"
import { loadLatestCompletedGameReview } from "../../round-note/storage/roundNoteStorage"
import { loadHostLifecycle } from "../storage/hostLifecycleStorage"
import { useLanguage } from "../../../contexts/LanguageProvider"

const roles: GameSetupRole[] = characters.map(character => ({ roleId: character.id, name: character.nameEn || character.name, team: character.team, recommended: character.recommended === true, maxQuantity: character.max ?? 1 }))

export type HostRoomRouteContext = Readonly<{
  roomCode: string
  players: GameSetupPlayer[]
  roles: GameSetupRole[]
  game: HostGameController
}>

export function useHostRoomRoute(): HostRoomRouteContext {
  return useOutletContext<HostRoomRouteContext>()
}

export default function HostRoomPage() {
  const { translate } = useLanguage()
  const { roomCode = "" } = useParams()
  const canonicalCode = canonicalRoomCode(roomCode)
  const code = canonicalCode ?? roomCode
  const hostId = canonicalCode ? getHostCredential(code) : null
  const navigate = useNavigate()
  const location = useLocation()
  const joinUrl = createJoinUrl(code)
  const [snapshot, setSnapshot] = useState<PlayerListSnapshot | null>(null)
  const generation = useRef(0)
  const clientRef = useRef<Client | null>(null)
  const playerCount = snapshot?.currentPlayers ?? 0
  const maxPlayers = snapshot?.maxPlayers ?? 6
  const players = useMemo(() => snapshot?.players.map(player => ({ playerId: player.playerId, playerName: player.playerName, ready: player.ready })) ?? [], [snapshot])
  const game = useHostGame(code, hostId ?? "", players, roles, snapshot?.status ?? "WAITING", snapshot?.activeRoles ?? [])
  const { confirmed, draft, setDraft, status, error, canSubmit, submit } = useUpdateMaxPlayers({ confirmedMaxPlayers: maxPlayers, playerCount, roomCode: code, hostId })

  useEffect(() => {
    if (canonicalCode) loadHostLifecycle(code)
  }, [canonicalCode, code])

  useEffect(() => {
    if (!canonicalCode || !hostId) return
    const currentGeneration = ++generation.current
    let disposed = false
    const client = createHostRoomClient(code, hostId, value => {
      if (!disposed && generation.current === currentGeneration) setSnapshot(value)
    }, () => {
      if (disposed || generation.current !== currentGeneration) return
      game.reconcileEnded()
      setSnapshot(current => current ? { ...current, status: "WAITING", players: current.players.map(player => ({ ...player, ready: false })) } : current)
      navigate(routePaths.hostRoom(code), { replace: true })
    })
    clientRef.current = client
    client.activate()
    return () => {
      disposed = true
      generation.current++
      if (clientRef.current === client) clientRef.current = null
      void deactivateHostRoomClient(client)
    }
  }, [canonicalCode, code, hostId])

  useEffect(() => {
    if (snapshot?.status === "PLAYING" && location.pathname !== routePaths.hostRoundNote(code)) navigate(routePaths.hostRoundNote(code), { replace: true })
    if (snapshot?.status === "WAITING" && location.pathname === routePaths.hostSetup(code) && game.active) navigate(routePaths.hostRoom(code), { replace: true })
  }, [snapshot?.status, location.pathname, code, navigate, game.active])

  const credentialMissing = hostId === null
  const displayError = credentialMissing ? { code: "HOST_CREDENTIAL_MISSING", message: HOST_CREDENTIAL_UNAVAILABLE_MESSAGE } : error
  const presentation = credentialMissing
    ? { status: "error" as const, roomCode: code, joinUrl, error: { code: "HOST_CREDENTIAL_MISSING", message: translate("Tab trình duyệt này không còn quyền Host.", "This browser tab no longer has Host access.") }, isMockStatus: false }
    : { status: game.active ? "in-game" as const : "waiting" as const, roomCode: code, joinUrl, error: null, isMockStatus: false }
  const context: HostRoomRouteContext = { roomCode: code, players, roles, game }

  return (
    <HostRoomShell
      presentation={presentation}
      snapshot={snapshot}
      gameActive={game.active}
      game={game}
      roles={roles}
      hasReview={loadLatestCompletedGameReview(code) !== null}
      showRouteOnly={location.pathname === routePaths.hostSetup(code) || location.pathname === routePaths.hostRoundNote(code)}
      routeContent={credentialMissing ? null : <Outlet context={context} />}
      maxPlayersControl={{ confirmedMaxPlayers: confirmed, playerCount, draft, onDraftChange: setDraft, loading: status === "loading", error: displayError, canSubmit: canSubmit && !game.active, disabled: game.active, onSubmit: (val?: number) => void submit(val) }}
    />
  )
}
