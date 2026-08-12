import { beforeEach, describe, expect, it } from "vitest"
import {
  HOW_TO_PLAY_ORIGIN_KEY,
  isActiveRoomOrigin,
  loadHowToPlayOrigin,
  storeHowToPlayOrigin,
  validateHowToPlayOrigin,
} from "./howToPlayOrigin"

describe("How-to-Play origin validation", () => {
  beforeEach(() => sessionStorage.clear())

  it("accepts exact internal paths and preserves search and hash", () => {
    const origin = "/player/A7K9Q2/card?view=compact#role"
    expect(validateHowToPlayOrigin(origin)).toBe(origin)
    storeHowToPlayOrigin(origin)
    expect(loadHowToPlayOrigin()).toBe(origin)
    expect(sessionStorage.getItem(HOW_TO_PLAY_ORIGIN_KEY)).toBe(origin)
    expect(isActiveRoomOrigin(origin)).toBe(true)
  })

  it.each([
    "https://evil.test/player/A7K9Q2",
    "//evil.test/player/A7K9Q2",
    "javascript:alert(1)",
    "/\\evil.test",
    "/#how-to-play",
    "not-an-internal-path",
  ])("rejects unsafe or looping origin %s", origin => {
    expect(validateHowToPlayOrigin(origin)).toBeNull()
  })
})
