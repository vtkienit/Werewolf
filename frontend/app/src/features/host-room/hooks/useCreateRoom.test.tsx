import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useCreateRoom } from "./useCreateRoom"

describe("useCreateRoom", () => {
  it("starts idle, blocks duplicate requests, and supports retry after an error", async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ roomCode: "A7K9Q2", hostId: "host", qrUrl: "url" })
    const { result } = renderHook(() => useCreateRoom(request))
    expect(result.current.status).toBe("idle")
    await act(async () => { await Promise.all([result.current.create(), result.current.create()]) })
    expect(request).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBe("offline")
    await act(async () => { await result.current.create() })
    expect(result.current.status).toBe("success")
  })
})
