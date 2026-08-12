import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useUpdateMaxPlayers } from "./useUpdateMaxPlayers"

describe("useUpdateMaxPlayers", () => {
  it("keeps the confirmed value unchanged while loading and prevents duplicate calls", async () => {
    let resolveRequest!: (value: { maxPlayers: number }) => void
    const request = vi.fn(() => new Promise<{ maxPlayers: number }>((done) => {
      resolveRequest = done
    }))
    const { result } = renderHook(() =>
      useUpdateMaxPlayers({ confirmedMaxPlayers: 6, playerCount: 0, roomCode: "A7K9Q2", hostId: "host", request }),
    )
    expect(result.current.confirmed).toBe(6)
    act(() => result.current.setDraft(9))

    let first: Promise<unknown> = Promise.resolve()
    let second: Promise<unknown> = Promise.resolve()
    act(() => {
      first = result.current.submit()
      second = result.current.submit()
    })
    await waitFor(() => expect(result.current.status).toBe("loading"))
    expect(request).toHaveBeenCalledTimes(1)
    expect(result.current.confirmed).toBe(6)

    await act(async () => {
      resolveRequest({ maxPlayers: 9 })
      await Promise.all([first, second])
    })
    expect(result.current.confirmed).toBe(9)
    expect(result.current.status).toBe("success")
  })

  it("keeps the previous confirmed value on failure and supports retry that clears the stale error", async () => {
    const request = vi.fn()
      .mockRejectedValueOnce(new Error("Unable to connect to the server"))
      .mockResolvedValueOnce({ maxPlayers: 9 })
    const { result } = renderHook(() =>
      useUpdateMaxPlayers({ confirmedMaxPlayers: 6, playerCount: 0, roomCode: "A7K9Q2", hostId: "host", request }),
    )
    act(() => result.current.setDraft(9))
    await act(async () => { await result.current.submit() })
    expect(result.current.confirmed).toBe(6)
    expect(result.current.status).toBe("error")
    expect(result.current.error).toEqual({ code: "UPDATE_FAILED", message: "Unable to connect to the server" })

    await act(async () => { await result.current.submit() })
    expect(result.current.error).toBeNull()
    expect(result.current.confirmed).toBe(9)
    expect(result.current.status).toBe("success")
  })

  it("does not send a request when the host credential is missing", async () => {
    const request = vi.fn()
    const { result } = renderHook(() =>
      useUpdateMaxPlayers({ confirmedMaxPlayers: 6, playerCount: 0, roomCode: "A7K9Q2", hostId: null, request }),
    )
    act(() => result.current.setDraft(9))
    await act(async () => { await result.current.submit() })
    expect(request).not.toHaveBeenCalled()
    expect(result.current.status).toBe("error")
    expect(result.current.error).toEqual({ code: "HOST_CREDENTIAL_MISSING", message: "Host credential is unavailable" })
  })

  it("can retry successfully after the missing credential becomes available", async () => {
    const request = vi.fn().mockResolvedValue({ maxPlayers: 9 })
    const { result, rerender } = renderHook(
      ({ hostId }: { hostId: string | null }) =>
        useUpdateMaxPlayers({ confirmedMaxPlayers: 6, playerCount: 0, roomCode: "A7K9Q2", hostId, request }),
      { initialProps: { hostId: null as string | null } },
    )
    act(() => result.current.setDraft(9))
    await act(async () => { await result.current.submit() })
    expect(request).not.toHaveBeenCalled()

    rerender({ hostId: "host-id" })
    await act(async () => { await result.current.submit() })
    expect(request).toHaveBeenCalledWith("A7K9Q2", "host-id", 9)
    expect(result.current.confirmed).toBe(9)
    expect(result.current.error).toBeNull()
  })

  it("does not allow submitting below the player count", () => {
    const request = vi.fn()
    const { result } = renderHook(() =>
      useUpdateMaxPlayers({ confirmedMaxPlayers: 12, playerCount: 8, roomCode: "A7K9Q2", hostId: "host", request }),
    )
    expect(result.current.canSubmit).toBe(false)
  })
})
