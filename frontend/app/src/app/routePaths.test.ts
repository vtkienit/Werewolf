import { describe, expect, it } from "vitest"
import { routePaths } from "./routePaths"

describe("routePaths", () => {
  it("builds every locked production route and encodes dynamic Room codes", () => {
    expect(routePaths.home).toBe("/")
    expect(routePaths.hostCreate).toBe("/host/create")
    expect(routePaths.hostRoom("A/B C")).toBe("/host/rooms/A%2FB%20C")
    expect(routePaths.hostSetup("A/B C")).toBe("/host/rooms/A%2FB%20C/setup")
    expect(routePaths.hostRoundNote("A/B C")).toBe("/host/rooms/A%2FB%20C/round-note")
    expect(routePaths.joinRoom("A/B C")).toBe("/join/A%2FB%20C")
    expect(routePaths.playerWaiting("A/B C")).toBe("/player/A%2FB%20C")
    expect(routePaths.playerCard("A/B C")).toBe("/player/A%2FB%20C/card")
  })
})
