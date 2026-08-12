import { describe, expect, it } from "vitest"
import { initialPlayerGameState, reducePlayerGameState } from "../config/playerGameState"
import { parseStartGameEvent } from "../config/playerGameTypes"

const start = parseStartGameEvent({ gameId: "game-001", playerName: "Kien", roleId: "werewolf" })!

describe("player game state", () => {
  it("moves waiting to hidden, revealed, hidden, and revealed", () => {
    const hidden = reducePlayerGameState(initialPlayerGameState, { type: "START", event: start })
    expect(hidden).toMatchObject({ status: "ROLE_RECEIVED_HIDDEN", gameId: "game-001", playerName: "Kien", roleId: "werewolf" })
    const revealed = reducePlayerGameState(hidden, { type: "REVEAL" }); expect(revealed.status).toBe("ROLE_REVEALED")
    const hiddenAgain = reducePlayerGameState(revealed, { type: "HIDE" }); expect(hiddenAgain.status).toBe("ROLE_HIDDEN")
    expect(reducePlayerGameState(hiddenAgain, { type: "REVEAL" }).status).toBe("ROLE_REVEALED")
  })

  it("matching end clears role and permits a different new game", () => {
    const active = reducePlayerGameState(initialPlayerGameState, { type: "START", event: start })
    const ended = reducePlayerGameState(active, { type: "END", event: { gameId: "game-001" } })
    expect(ended).toEqual({ status: "WAITING_FOR_GAME", lastEndedGameId: "game-001" })
    const next = reducePlayerGameState(ended, { type: "START", event: { ...start, gameId: "game-002" } })
    expect(next).toMatchObject({ status: "ROLE_RECEIVED_HIDDEN", gameId: "game-002" })
  })

  it("handles duplicate, conflicting, different-game, stale start, and stale end safely", () => {
    const active = reducePlayerGameState(initialPlayerGameState, { type: "START", event: start })
    expect(reducePlayerGameState(active, { type: "START", event: start })).toBe(active)
    const conflict = reducePlayerGameState(active, { type: "START", event: { ...start, roleId: "seer" as typeof start.roleId } })
    expect(conflict).toMatchObject({ roleId: "werewolf", statusMarker: "GAME_EVENT_CONFLICT" })
    expect(reducePlayerGameState(active, { type: "START", event: { ...start, gameId: "game-002" } })).toMatchObject({ gameId: "game-001", statusMarker: "GAME_EVENT_CONFLICT" })
    expect(reducePlayerGameState(active, { type: "END", event: { gameId: "old-game" } })).toBe(active)
    const waiting = reducePlayerGameState(initialPlayerGameState, { type: "END", event: { gameId: "game-001" } })
    expect(reducePlayerGameState(waiting, { type: "START", event: start })).toBe(waiting)
  })

  it("clears on terminal auth/reset and preserves on reconnect", () => {
    const active = reducePlayerGameState(initialPlayerGameState, { type: "START", event: start })
    expect(reducePlayerGameState(active, { type: "SOCKET_RECONNECT" })).toBe(active)
    expect(reducePlayerGameState(active, { type: "TERMINAL_AUTH" })).toEqual(initialPlayerGameState)
    expect(reducePlayerGameState(active, { type: "RESET" })).toEqual(initialPlayerGameState)
  })

  it("is immutable and deterministic", () => {
    const previous = Object.freeze({ ...initialPlayerGameState })
    const one = reducePlayerGameState(previous, { type: "START", event: start })
    const two = reducePlayerGameState(previous, { type: "START", event: start })
    expect(previous).toEqual(initialPlayerGameState); expect(one).toEqual(two); expect(one).not.toBe(previous)
  })
})
