import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { Client } from "@stomp/stompjs"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { routePaths } from "../app/routePaths"
import { initialPlayerGameState, reducePlayerGameState } from "../config/playerGameState"
import type { PlayerGameAction, PlayerGameState } from "../config/playerGameState"
import type { PlayerListSnapshot } from "../config/playerLobbyTypes"
import { canonicalRoomCode, clearPlayerSession, loadPlayerSession } from "../config/playerSessionStorage"
import { createLobbyClient, deactivateLobbyClient } from "../config/playerSocket"
import { updatePlayerReady } from "../config/playerReadyApi"
import { useLanguage } from "../contexts/LanguageProvider"

export type PlayerRouteContextValue = Readonly<{
  roomCode: string
  player: Readonly<{ playerId: string; playerName: string }>
  snapshot: PlayerListSnapshot | null
  connectionState: "Connecting" | "Connected" | "Reconnecting" | "Authentication failed"
  gameState: PlayerGameState
  revealRole: () => void
  hideRole: () => void
  returnToWaiting: () => void
  setReady?: (ready: boolean) => Promise<void>
  readyPending?: boolean
  readyError?: string
}>

export const PlayerRouteContext = createContext<PlayerRouteContextValue | null>(null)
export function usePlayerRouteContext(): PlayerRouteContextValue {
  const value = useContext(PlayerRouteContext)
  if (!value) throw new Error("Player route context is unavailable")
  return value
}

export default function PlayerRoomPage() {
  const { translate } = useLanguage()
  const { roomCode = "" } = useParams()
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const code = canonicalRoomCode(roomCode)
  const session = code ? loadPlayerSession(code) : null
  const [snapshot, setSnapshot] = useState<PlayerListSnapshot | null>(null)
  const [connectionState, setConnectionState] = useState<PlayerRouteContextValue["connectionState"]>("Connecting")
  const [gameState, setGameState] = useState<PlayerGameState>(initialPlayerGameState)
  const [readyPending, setReadyPending] = useState(false)
  const [readyError, setReadyError] = useState("")
  const gameStateRef = useRef(gameState)
  const clientRef = useRef<Client | null>(null)
  const generationRef = useRef(0)

  const updateGame = (action: PlayerGameAction): PlayerGameState => {
    const next = reducePlayerGameState(gameStateRef.current, action)
    gameStateRef.current = next
    setGameState(next)
    return next
  }

  useEffect(() => {
    if (!code) { navigateRef.current(routePaths.home, { replace: true }); return }
    if (!session || session.roomCode !== code) { navigateRef.current(routePaths.joinRoom(code), { replace: true }); return }

    const generation = ++generationRef.current
    let disposed = false
    let terminal = false
    let deactivated = false
    const active = () => !disposed && !terminal && generationRef.current === generation
    const stop = (client: Client) => { if (!deactivated) { deactivated = true; void deactivateLobbyClient(client) } }
    const client = createLobbyClient(code, session, {
      onSnapshot: value => { if (active()) { setSnapshot(value); setConnectionState("Connected") } },
      onTemporaryFailure: () => { if (active()) { updateGame({ type: "SOCKET_RECONNECT" }); setConnectionState("Reconnecting") } },
      onStartGame: event => {
        if (!active()) return
        const previous = gameStateRef.current
        const next = updateGame({ type: "START", event })
        if (previous.status === "WAITING_FOR_GAME" && next.status !== "WAITING_FOR_GAME" && next.gameId === event.gameId) navigateRef.current(routePaths.playerCard(code))
      },
      onEndGame: event => {
        if (!active()) return
        const previous = gameStateRef.current
        const next = updateGame({ type: "END", event })
        if (event.winningSide && event.roles) setSnapshot(current => current ? { ...current, status: "WAITING", activeRoles: [], lastCompletedGame: { winningSide: event.winningSide!, roles: event.roles! } } : current)
        if (previous.status !== "WAITING_FOR_GAME" && next.status === "WAITING_FOR_GAME") navigateRef.current(routePaths.playerWaiting(code))
      },
      onAuthFailure: () => {
        if (!active()) return
        terminal = true
        generationRef.current++
        clearPlayerSession(code)
        updateGame({ type: "TERMINAL_AUTH" })
        setSnapshot(null)
        setConnectionState("Authentication failed")
        stop(client)
        if (clientRef.current === client) clientRef.current = null
        navigateRef.current(routePaths.joinRoom(code), { replace: true })
      },
    })
    clientRef.current = client
    client.activate()
    return () => {
      disposed = true
      generationRef.current++
      stop(client)
      if (clientRef.current === client) clientRef.current = null
    }
  }, [code, session?.playerId, session?.playerName, session?.playerToken, session?.roomCode])

  if (!code || !session || session.roomCode !== code) return null
  const context: PlayerRouteContextValue = {
    roomCode: code,
    player: { playerId: session.playerId, playerName: session.playerName },
    snapshot,
    connectionState,
    gameState,
    revealRole: () => updateGame({ type: "REVEAL" }),
    hideRole: () => updateGame({ type: "HIDE" }),
    returnToWaiting: () => navigateRef.current(routePaths.playerWaiting(code)),
    setReady: async ready => {
      if (readyPending || snapshot?.status !== "WAITING") return
      setReadyPending(true); setReadyError("")
      try { await updatePlayerReady(code, session.playerId, session.playerToken, ready) }
      catch (error) { setReadyError(error instanceof Error ? error.message : translate("Không thể cập nhật trạng thái sẵn sàng.", "Ready status could not be updated.")) }
      finally { setReadyPending(false) }
    },
    readyPending,
    readyError,
  }
  return <PlayerRouteContext.Provider value={context}><Outlet /></PlayerRouteContext.Provider>
}
