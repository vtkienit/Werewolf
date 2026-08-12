import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useClipboardFeedback } from "./useClipboardFeedback"

function deferred() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

describe("useClipboardFeedback", () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("writes the exact value, reports success, and resets after 2000 ms", async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { clipboard: { writeText } })
    const { result } = renderHook(() => useClipboardFeedback())

    await act(() => result.current.copy("A7K9Q2"))
    expect(writeText).toHaveBeenCalledWith("A7K9Q2")
    expect(result.current).toMatchObject({ status: "success", message: "Đã sao chép" })

    act(() => vi.advanceTimersByTime(1999))
    expect(result.current.status).toBe("success")
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toMatchObject({ status: "idle", message: null })
  })

  it("reports the same recoverable failure for rejection and unsupported clipboard", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } })
    const rejected = renderHook(() => useClipboardFeedback())
    await act(() => rejected.result.current.copy("secret-free-value"))
    expect(rejected.result.current).toMatchObject({
      status: "error",
      message: "Không thể sao chép. Hãy chọn và sao chép nội dung thủ công.",
    })
    rejected.unmount()

    vi.stubGlobal("navigator", {})
    const unsupported = renderHook(() => useClipboardFeedback())
    await act(() => unsupported.result.current.copy("value"))
    expect(unsupported.result.current.status).toBe("error")
  })

  it("restarts feedback timing on repeated copy and cleans the timer on unmount", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const clearSpy = vi.spyOn(globalThis, "clearTimeout")
    const { result, unmount } = renderHook(() => useClipboardFeedback())

    await act(() => result.current.copy("first"))
    act(() => vi.advanceTimersByTime(1500))
    await act(() => result.current.copy("second"))
    act(() => vi.advanceTimersByTime(501))
    expect(result.current.status).toBe("success")
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })

  it("keeps a newer success when an older request rejects later", async () => {
    vi.useFakeTimers()
    const first = deferred()
    const second = deferred()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise) } })
    const { result } = renderHook(() => useClipboardFeedback())
    let firstCopy!: Promise<void>
    let secondCopy!: Promise<void>
    act(() => { firstCopy = result.current.copy("first") })
    act(() => { secondCopy = result.current.copy("second") })

    await act(async () => { second.resolve(); await secondCopy })
    expect(result.current).toMatchObject({ status: "success", message: "Đã sao chép" })
    await act(async () => { first.reject(new Error("older failure")); await firstCopy })
    expect(result.current).toMatchObject({ status: "success", message: "Đã sao chép" })
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.status).toBe("idle")
  })

  it("keeps a newer rejection when an older request succeeds later", async () => {
    const first = deferred()
    const second = deferred()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise) } })
    const { result } = renderHook(() => useClipboardFeedback())
    let firstCopy!: Promise<void>
    let secondCopy!: Promise<void>
    act(() => { firstCopy = result.current.copy("first") })
    act(() => { secondCopy = result.current.copy("second") })

    await act(async () => { second.reject(new Error("latest failure")); await secondCopy })
    expect(result.current).toMatchObject({ status: "error", message: "Không thể sao chép. Hãy chọn và sao chép nội dung thủ công." })
    await act(async () => { first.resolve(); await firstCopy })
    expect(result.current).toMatchObject({ status: "error", message: "Không thể sao chép. Hãy chọn và sao chép nội dung thủ công." })
  })

  it("lets only the newer out-of-order success install the reset timer", async () => {
    vi.useFakeTimers()
    const first = deferred()
    const second = deferred()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise) } })
    const timerSpy = vi.spyOn(globalThis, "setTimeout")
    const { result } = renderHook(() => useClipboardFeedback())
    let firstCopy!: Promise<void>
    let secondCopy!: Promise<void>
    act(() => { firstCopy = result.current.copy("first") })
    act(() => { secondCopy = result.current.copy("second") })

    await act(async () => { second.resolve(); await secondCopy })
    await act(async () => { first.resolve(); await firstCopy })
    expect(timerSpy).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(1999))
    expect(result.current.status).toBe("success")
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.status).toBe("idle")
  })

  it("clears existing success timing as soon as a newer request starts", async () => {
    vi.useFakeTimers()
    const second = deferred()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValueOnce(undefined).mockReturnValueOnce(second.promise) } })
    const { result } = renderHook(() => useClipboardFeedback())
    await act(() => result.current.copy("first"))
    act(() => vi.advanceTimersByTime(1500))
    let secondCopy!: Promise<void>
    act(() => { secondCopy = result.current.copy("second") })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.status).toBe("success")
    await act(async () => { second.resolve(); await secondCopy })
    act(() => vi.advanceTimersByTime(1999))
    expect(result.current.status).toBe("success")
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.status).toBe("idle")
  })

  it("invalidates a pending completion on unmount without installing a timer", async () => {
    vi.useFakeTimers()
    const pending = deferred()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockReturnValue(pending.promise) } })
    const { result, unmount } = renderHook(() => useClipboardFeedback())
    let copy!: Promise<void>
    act(() => { copy = result.current.copy("value") })
    unmount()
    const timerSpy = vi.spyOn(globalThis, "setTimeout")
    pending.resolve()
    await copy
    expect(timerSpy).not.toHaveBeenCalled()
  })
})
