import { beforeEach, describe, expect, it } from "vitest"
import { getHostCredential, storeHostCredential } from "./hostCredentialStorage"

describe("host credential storage", () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it("stores hostId in sessionStorage under the locked key", () => {
    storeHostCredential("A7K9Q2", "host-id")
    expect(sessionStorage.getItem("masoi.host.rooms.A7K9Q2.hostId")).toBe("host-id")
    expect(localStorage.length).toBe(0)
  })

  it("retrieves the stored hostId under the exact key", () => {
    storeHostCredential("A7K9Q2", "host-id")
    expect(getHostCredential("A7K9Q2")).toBe("host-id")
  })

  it("returns null deterministically when the credential is missing", () => {
    expect(getHostCredential("A7K9Q2")).toBeNull()
  })

  it("never reads or writes localStorage", () => {
    storeHostCredential("A7K9Q2", "host-id")
    getHostCredential("A7K9Q2")
    expect(localStorage.length).toBe(0)
  })
})
