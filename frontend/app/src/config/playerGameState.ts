import type { EndGameEvent, RoleId, StartGameEvent } from "./playerGameTypes"

type WaitingState = Readonly<{ status: "WAITING_FOR_GAME"; lastEndedGameId?: string }>
type ActiveState = Readonly<{
  status: "ROLE_RECEIVED_HIDDEN" | "ROLE_REVEALED" | "ROLE_HIDDEN"
  gameId: string
  playerName: string
  roleId: RoleId
  lastEndedGameId?: string
  statusMarker?: "GAME_EVENT_CONFLICT"
}>
export type PlayerGameState = WaitingState | ActiveState
export type PlayerGameAction =
  | Readonly<{ type: "START"; event: StartGameEvent }>
  | Readonly<{ type: "END"; event: EndGameEvent }>
  | Readonly<{ type: "REVEAL" | "HIDE" | "TERMINAL_AUTH" | "RESET" | "SOCKET_RECONNECT" }>

export const initialPlayerGameState: PlayerGameState = Object.freeze({ status: "WAITING_FOR_GAME" })

export function reducePlayerGameState(state: PlayerGameState, action: PlayerGameAction): PlayerGameState {
  if (action.type === "TERMINAL_AUTH" || action.type === "RESET") return initialPlayerGameState
  if (action.type === "SOCKET_RECONNECT") return state
  if (action.type === "START") {
    if (state.status === "WAITING_FOR_GAME") {
      if (state.lastEndedGameId === action.event.gameId) return state
      return { status: "ROLE_RECEIVED_HIDDEN", ...action.event, lastEndedGameId: state.lastEndedGameId }
    }
    if (state.gameId === action.event.gameId && state.roleId === action.event.roleId) return state
    return state.statusMarker === "GAME_EVENT_CONFLICT" ? state : { ...state, statusMarker: "GAME_EVENT_CONFLICT" }
  }
  if (action.type === "END") {
    if (state.status === "WAITING_FOR_GAME") return state.lastEndedGameId === action.event.gameId ? state : { status: "WAITING_FOR_GAME", lastEndedGameId: action.event.gameId }
    return state.gameId === action.event.gameId ? { status: "WAITING_FOR_GAME", lastEndedGameId: action.event.gameId } : state
  }
  if (action.type === "REVEAL" && (state.status === "ROLE_RECEIVED_HIDDEN" || state.status === "ROLE_HIDDEN")) return { ...state, status: "ROLE_REVEALED" }
  if (action.type === "HIDE" && state.status === "ROLE_REVEALED") return { ...state, status: "ROLE_HIDDEN" }
  return state
}
