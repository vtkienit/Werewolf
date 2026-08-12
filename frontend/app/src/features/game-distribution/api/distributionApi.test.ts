import { afterEach, describe, expect, it, vi } from "vitest"
import { confirmGameSetup, endGame, startGame } from "./distributionApi"

describe("confirmGameSetup", () => {
  afterEach(() => vi.unstubAllGlobals())
  it("accepts only the public aggregated role response", async () => {
    const response = { roomCode: "ABC123", activeRoles: [{ roleId: "seer", quantity: 1 }, { roleId: "werewolf", quantity: 2 }] }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })))
    await expect(confirmGameSetup("ABC123", { hostId: "host", roles: response.activeRoles })).resolves.toEqual(response)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/distribution/rooms/ABC123/setup"), expect.objectContaining({ method: "POST" }))
  })
})

describe("startGame", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("accepts the Host-authenticated assignment response", async () => {
    const response = { roomCode: "ABC123", numberPlayers: 2, gameSessionId: "game-1", assignments: [{ playerId: "p1", playerName: "A", roleId: "seer", roleName: "Seer" }, { playerId: "p2", playerName: "B", roleId: "villager", roleName: "Villager" }] }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })))

    await expect(startGame("ABC123", { hostId: "host", roles: [] })).resolves.toEqual(response)
  })

  it("rejects legacy public Player fields instead of the private assignment contract", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "ABC123", numberPlayers: 1, players: [{ playerId: "p1", playerName: "Player", roleId: "werewolf" }] }), { status: 200 })))

    await expect(startGame("ABC123", { hostId: "host", roles: [] })).rejects.toThrow("Invalid Distribution response")
  })
})

describe("endGame", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("accepts the frontend-compatible End response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" }), { status: 200 })))

    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).resolves.toEqual({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" })
  })

  it("compares End response Room codes canonically", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "a7k9q2", hostId: "host", message: "end" }), { status: 200 })))
    await expect(endGame("A7K9Q2", { hostId: "host", winningSide: "VILLAGE" })).resolves.toEqual({ roomCode: "a7k9q2", hostId: "host", message: "end" })
  })

  it("rejects End responses that omit hostId", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "ABC123", message: "end", status: "success" }), { status: 200 })))

    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).rejects.toThrow("Invalid Distribution response")
  })

  it.each([
    ["players", { players: [] }],
    ["assignments", { assignments: [] }],
    ["roleId", { roleId: "werewolf" }],
    ["gameId", { gameId: "game-1" }],
    ["internal token", { INTERNAL_REALTIME_TOKEN: "secret" }],
    ["unknown field", { extra: true }],
  ])("rejects End responses containing %s", async (_label, extra) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "ABC123", hostId: "host", message: "end", status: "success", ...extra }), { status: 200 })))
    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).rejects.toThrow("Invalid Distribution response")
  })

  it("rejects mismatched Rooms and wrong Host identity types", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ roomCode: "B8M2P4", hostId: "host", message: "end", status: "success" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ roomCode: "ABC123", hostId: 42, message: "end", status: "success" }), { status: 200 })))
    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).rejects.toThrow("Invalid Distribution response")
    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).rejects.toThrow("Invalid Distribution response")
  })

  it.each(["", "   ", "\t\n"])('rejects blank Host identity %j', async hostId => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "ABC123", hostId, message: "end", status: "success" }), { status: 200 })))
    await expect(endGame("ABC123", { hostId: "host", winningSide: "VILLAGE" })).rejects.toThrow("Invalid Distribution response")
  })
})
