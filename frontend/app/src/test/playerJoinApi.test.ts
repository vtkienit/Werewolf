import { afterEach, describe, expect, it, vi } from "vitest"
import { joinRoom } from "../config/playerJoinApi"

afterEach(() => vi.unstubAllGlobals())

describe("player join API", () => {
  it("uses the gateway API and accepts only the exact response shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ playerId: "p", playerName: "An", playerToken: "secret" }), { status: 201 }))
    vi.stubGlobal("fetch", fetchMock)
    await expect(joinRoom("A7K9Q2", "An")).resolves.toEqual({ playerId: "p", playerName: "An", playerToken: "secret" })
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/api/rooms/A7K9Q2/players", expect.objectContaining({ method: "POST" }))
  })

  it("rejects missing, blank, null, non-string, and unknown response fields", async () => {
    const invalid = [
      { playerId: "p", playerName: "An" },
      { playerId: "p", playerName: "An", playerToken: "" },
      { playerId: "p", playerName: "An", playerToken: "   " },
      { playerId: null, playerName: "An", playerToken: "secret" },
      { playerId: 1, playerName: "An", playerToken: "secret" },
      { playerId: "p", playerName: "An", playerToken: "secret", roleId: "wolf" },
    ]
    for (const value of invalid) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(value), { status: 201 })))
      await expect(joinRoom("A7K9Q2", "An")).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
      vi.unstubAllGlobals()
    }
  })

  it("rejects malformed JSON without exposing the response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{", { status: 201 })))
    await expect(joinRoom("A7K9Q2", "An")).rejects.toMatchObject({ code: "INVALID_RESPONSE" })
  })
})
