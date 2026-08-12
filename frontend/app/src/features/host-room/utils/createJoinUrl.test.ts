import { describe, expect, it } from "vitest"
import { createJoinUrl } from "./createJoinUrl"

describe("createJoinUrl", () => {
  it("creates an absolute join URL from a production HTTPS origin", () => {
    expect(createJoinUrl("A7K9Q2", "https://werewolf.example")).toBe(
      "https://werewolf.example/join/A7K9Q2",
    )
  })

  it("preserves a localhost port and remains deterministic across reloads", () => {
    expect(createJoinUrl("A7K9Q2", "http://localhost:5173")).toBe(
      "http://localhost:5173/join/A7K9Q2",
    )
    expect(createJoinUrl("A7K9Q2", "http://localhost:5173")).toBe(
      "http://localhost:5173/join/A7K9Q2",
    )
  })

  it("encodes the room code as one safe path segment without using an API base", () => {
    const result = createJoinUrl("A7 K/9?", "https://werewolf.example")
    expect(result).toBe("https://werewolf.example/join/A7%20K%2F9%3F")
    expect(result).not.toContain("/api/")
    expect(result).not.toContain(":8080")
  })
})
