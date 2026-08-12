import { afterEach, describe, expect, it, vi } from "vitest"
import { CreateRoomClientError, createRoom } from "./createRoomApi"

describe("createRoom", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("posts a bodyless request to the Gateway and parses the exact response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ roomCode: "A7K9Q2", hostId: "host", qrUrl: "http://localhost/join/A7K9Q2" }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    ))
    vi.stubGlobal("fetch", fetchMock)

    await expect(createRoom()).resolves.toEqual({ roomCode: "A7K9Q2", hostId: "host", qrUrl: "http://localhost/join/A7K9Q2" })
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8080/api/rooms", {
      method: "POST", headers: { Accept: "application/json" },
    })
  })

  it("rejects malformed success and invalid JSON deterministically", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ roomCode: "A", hostId: "B", qrUrl: "C", extra: true }), { status: 201 })))
    await expect(createRoom()).rejects.toThrow("Invalid Create Room response")

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not-json", { status: 201 })))
    await expect(createRoom()).rejects.toThrow("Invalid JSON")

  })

  it("preserves exact backend errors and rejects invalid backend errors deterministically", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "ROOM_STORAGE_UNAVAILABLE", message: "Room storage is unavailable" }), { status: 503 })))
    await expect(createRoom()).rejects.toEqual(new CreateRoomClientError("ROOM_STORAGE_UNAVAILABLE", "Room storage is unavailable"))

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "technical detail" }), { status: 500 })))
    await expect(createRoom()).rejects.toEqual(new CreateRoomClientError("INVALID_RESPONSE", "Invalid Create Room error response"))
  })

  it("normalizes rejected fetch without exposing runtime wording", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline browser wording")))
    const error = await createRoom().catch((cause: unknown) => cause)
    expect(error).toEqual(new CreateRoomClientError("NETWORK_ERROR", "Unable to connect to the server"))
    expect((error as Error).message).not.toContain("offline")
  })
})
