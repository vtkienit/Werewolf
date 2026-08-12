import { afterEach, describe, expect, it } from "vitest"
import { clearPlayerSession, loadPlayerSession, playerSessionKey, storePlayerSession } from "../config/playerSessionStorage"

afterEach(() => sessionStorage.clear())
describe("player session storage", () => {
  it("uses the exact canonical session key", () => expect(playerSessionKey("A7K9Q2")).toBe("masoi.player.rooms.A7K9Q2.session"))
  it("stores and strictly reloads the approved session shape", () => {
    expect(storePlayerSession({ roomCode: "a7k9q2", playerId: "p", playerName: "An", playerToken: "secret" })).toBe(true)
    expect(loadPlayerSession("A7K9Q2")).toEqual({ roomCode: "A7K9Q2", playerId: "p", playerName: "An", playerToken: "secret" })
  })
  it("removes malformed data", () => { sessionStorage.setItem(playerSessionKey("A7K9Q2"), '{"playerId":"p"}'); expect(loadPlayerSession("A7K9Q2")).toBeNull(); expect(sessionStorage.getItem(playerSessionKey("A7K9Q2"))).toBeNull() })
  it("removes every invalid stored shape without touching another room", () => {
    const invalid = ["{", JSON.stringify({ roomCode: "A7K9Q2", playerId: "p", playerName: "An", playerToken: "secret", roleId: "wolf" }), JSON.stringify({ roomCode: "A7K9Q2", playerId: null, playerName: "An", playerToken: "secret" }), JSON.stringify({ roomCode: "B7K9Q2", playerId: "p", playerName: "An", playerToken: "secret" })]
    for (const value of invalid) { sessionStorage.setItem(playerSessionKey("A7K9Q2"), value); expect(loadPlayerSession("A7K9Q2")).toBeNull(); expect(sessionStorage.getItem(playerSessionKey("A7K9Q2"))).toBeNull() }
    sessionStorage.setItem(playerSessionKey("B7K9Q2"), JSON.stringify({ roomCode: "B7K9Q2", playerId: "b", playerName: "Binh", playerToken: "other" }))
    clearPlayerSession("A7K9Q2")
    expect(sessionStorage.getItem(playerSessionKey("B7K9Q2"))).not.toBeNull()
  })
})

