import { afterEach, describe, expect, it, vi } from "vitest"
import { UpdateMaxPlayersClientError, updateMaxPlayers } from "./updateMaxPlayersApi"

describe("updateMaxPlayers", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("patches the exact Gateway URL with method, encoded path, headers and body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ maxPlayers: 9 }), { status: 200, headers: { "Content-Type": "application/json" } }),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(updateMaxPlayers("A7K9Q2", "host-id", 9)).resolves.toEqual({ maxPlayers: 9 })
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/api/rooms/A7K9Q2/max-players", {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Host-Id": "host-id",
      },
      body: JSON.stringify({ maxPlayers: 9 }),
    })
  })

  it("encodes the room code path segment", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ maxPlayers: 6 }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    await updateMaxPlayers("A7 K9", "host", 6)
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8080/api/rooms/A7%20K9/max-players")
  })

  it("rejects success payloads with extra or missing fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ maxPlayers: 9, extra: 1 }), { status: 200 })))
    await expect(updateMaxPlayers("A7K9Q2", "host", 9)).rejects.toThrow("Invalid Update Max Players response")

    for (const maxPlayers of [9.5, 5, 13]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ maxPlayers }), { status: 200 })))
      await expect(updateMaxPlayers("A7K9Q2", "host", 9)).rejects.toThrow("Invalid Update Max Players response")
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })))
    await expect(updateMaxPlayers("A7K9Q2", "host", 9)).rejects.toThrow("Invalid Update Max Players response")

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ maxPlayers: "9" }), { status: 200 })))
    await expect(updateMaxPlayers("A7K9Q2", "host", 9)).rejects.toThrow("Invalid Update Max Players response")
  })

  it("preserves exact backend errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "MAX_PLAYERS_BELOW_PLAYER_COUNT", message: "maxPlayers cannot be lower than the current player count" }), { status: 409 }),
      ),
    )
    await expect(updateMaxPlayers("A7K9Q2", "host", 7)).rejects.toEqual(
      new UpdateMaxPlayersClientError("MAX_PLAYERS_BELOW_PLAYER_COUNT", "maxPlayers cannot be lower than the current player count"),
    )
  })

  it("rejects invalid backend error payloads deterministically", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "technical detail" }), { status: 500 })))
    await expect(updateMaxPlayers("A7K9Q2", "host", 9)).rejects.toEqual(
      new UpdateMaxPlayersClientError("INVALID_RESPONSE", "Invalid Update Max Players error response"),
    )
  })

  it("normalizes transport failures to NETWORK_ERROR without exposing runtime wording", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline browser wording")))
    const error = await updateMaxPlayers("A7K9Q2", "host", 9).catch((cause: unknown) => cause)
    expect(error).toEqual(new UpdateMaxPlayersClientError("NETWORK_ERROR", "Unable to connect to the server"))
    expect((error as Error).message).not.toContain("offline")
  })
})
