import { Client } from "@stomp/stompjs"
import type { StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { environment } from "./environment"
import { parseEndGameEvent, parseStartGameEvent } from "./playerGameTypes"
import type { EndGameEvent, StartGameEvent } from "./playerGameTypes"
import type { PlayerListSnapshot, PlayerSession } from "./playerLobbyTypes"
import { parsePublicCompletedGame, parsePublicRoles } from "./publicRoomSummary"

type LobbyCallbacks = Readonly<{
  onSnapshot: (snapshot: PlayerListSnapshot) => void
  onStartGame?: (event: StartGameEvent) => void
  onEndGame?: (event: EndGameEvent) => void
  onAuthFailure: () => void
  onTemporaryFailure: () => void
}>

const subscriptions = new WeakMap<Client, StompSubscription[]>()
const deactivated = new WeakSet<Client>()
export function snapshotDestination(roomCode: string) { return "/broadcast/rooms/" + roomCode + "/players" }
export function startGameDestination(roomCode: string, playerId: string) { return "/broadcast/distribution/rooms/" + roomCode + "/start-game/" + playerId }
export function endGameDestination(roomCode: string) { return "/broadcast/rooms/" + roomCode + "/end-game" }
export function connectDestination(roomCode: string) { return "/app/rooms/" + roomCode + "/connect" }
export function parseSnapshot(value: unknown, roomCode: string): PlayerListSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null; const v = value as Record<string, unknown>
  const keys = Object.keys(v)
  if (keys.some(key => !["roomCode", "status", "currentPlayers", "maxPlayers", "players", "activeRoles", "lastCompletedGame"].includes(key)) || keys.length < 5 || v.roomCode !== roomCode || (v.status !== "WAITING" && v.status !== "PLAYING") || typeof v.currentPlayers !== "number" || typeof v.maxPlayers !== "number" || !Number.isInteger(v.currentPlayers) || !Number.isInteger(v.maxPlayers) || !Array.isArray(v.players) || v.currentPlayers !== v.players.length || v.currentPlayers < 0 || v.maxPlayers < 1 || v.currentPlayers > v.maxPlayers) return null
  const players = v.players as unknown[]
  if (!players.every(player => { if (!player || typeof player !== "object" || Array.isArray(player)) return false; const record = player as Record<string, unknown>; return Object.keys(record).length === 4 && typeof record.playerId === "string" && record.playerId.trim() !== "" && typeof record.playerName === "string" && record.playerName.trim() !== "" && typeof record.isConnected === "boolean" && typeof record.ready === "boolean" }) || new Set(players.map(player => (player as Record<string, string>).playerId)).size !== players.length) return null
  return { roomCode, status: v.status, currentPlayers: v.currentPlayers, maxPlayers: v.maxPlayers, players: v.players as PlayerListSnapshot["players"], activeRoles: parsePublicRoles(v.activeRoles), lastCompletedGame: parsePublicCompletedGame(v.lastCompletedGame) }
}
export function createLobbyClient(roomCode: string, session: PlayerSession, callbacks: LobbyCallbacks): Client {
  const client = new Client({ webSocketFactory: () => new SockJS(environment.webSocketUrl), reconnectDelay: 2000, onStompError: frame => { if (isAuthenticationError(frame.body, frame.headers.message)) safeCall(callbacks.onAuthFailure) }, onWebSocketClose: () => safeCall(callbacks.onTemporaryFailure), onWebSocketError: () => safeCall(callbacks.onTemporaryFailure) })
  client.onConnect = () => {
    if (deactivated.has(client)) return
    subscriptions.get(client)?.forEach(subscription => subscription.unsubscribe())
    const active = [
      client.subscribe(snapshotDestination(roomCode), message => handle(message.body, value => parseSnapshot(value, roomCode), callbacks.onSnapshot)),
      client.subscribe(startGameDestination(roomCode, session.playerId), message => handle(message.body, parseStartGameEvent, callbacks.onStartGame), { "X-Player-Token": session.playerToken }),
      client.subscribe(endGameDestination(roomCode), message => handle(message.body, parseEndGameEvent, callbacks.onEndGame)),
    ]
    subscriptions.set(client, active)
    client.publish({ destination: connectDestination(roomCode), body: JSON.stringify({ playerId: session.playerId, playerToken: session.playerToken }) })
  }
  return client
}

function handle<T>(body: string, parse: (value: unknown) => T | null, callback: ((value: T) => void) | undefined): void {
  try { const value = parse(JSON.parse(body) as unknown); if (value && callback) safeCall(() => callback(value)) } catch { }
}
function safeCall(callback: () => void): void { try { callback() } catch { } }
function isAuthenticationError(body: string, message: string | undefined): boolean {
  if (message === "SOCKET_AUTH_FAILED") return true
  try {
    const value: unknown = JSON.parse(body)
    return !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 1 && (value as Record<string, unknown>).code === "SOCKET_AUTH_FAILED"
  } catch { return false }
}
export async function deactivateLobbyClient(client: Client): Promise<void> {
  if (deactivated.has(client)) return
  deactivated.add(client)
  subscriptions.get(client)?.forEach(subscription => subscription.unsubscribe())
  subscriptions.delete(client)
  await client.deactivate()
}
