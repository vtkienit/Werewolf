import { beforeEach, describe, expect, it, vi } from "vitest"
import { hostLifecycleStorageKey, loadHostLifecycle } from "./hostLifecycleStorage"
describe("host lifecycle presentation cache", () => {
  beforeEach(() => sessionStorage.clear())
  it("treats persisted PLAYING as a non-authoritative stale hint", () => {
    sessionStorage.setItem(hostLifecycleStorageKey("a7k9q2"), "PLAYING")
    sessionStorage.setItem(hostLifecycleStorageKey("B8M2P4"), "PLAYING")
    expect(loadHostLifecycle("A7K9Q2")).toBe("WAITING")
    expect(sessionStorage.getItem(hostLifecycleStorageKey("A7K9Q2"))).toBeNull()
    expect(sessionStorage.getItem(hostLifecycleStorageKey("B8M2P4"))).toBe("PLAYING")
  })
  it("falls back safely when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => { throw new Error("blocked") })
    expect(loadHostLifecycle("A7K9Q2")).toBe("WAITING")
  })
})
