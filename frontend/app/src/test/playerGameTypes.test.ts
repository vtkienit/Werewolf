import { describe, expect, it } from "vitest"
import { approvedRoleIds, isRoleId, parseEndGameEvent, parseStartGameEvent } from "../config/playerGameTypes"

describe("player game event parsing", () => {
  it("accepts exact start objects and JSON for every catalog role", () => {
    for (const roleId of approvedRoleIds) expect(parseStartGameEvent({ gameId: "game-001", playerName: "Kien", roleId })).toEqual({ gameId: "game-001", playerName: "Kien", roleId })
    expect(parseStartGameEvent('{"gameId":"game-001","playerName":"Kien","roleId":"werewolf"}')).toEqual({ gameId: "game-001", playerName: "Kien", roleId: "werewolf" })
  })

  it.each([
    undefined, null, [], 1, true, "not-json", '"string"',
    {}, { playerName: "Kien", roleId: "werewolf" }, { gameId: "g", roleId: "werewolf" }, { gameId: "g", playerName: "Kien" },
    { gameId: "g", playerName: "Kien", roleId: "werewolf", extra: true }, { GameId: "g", playerName: "Kien", roleId: "werewolf" },
    { gameId: "", playerName: "Kien", roleId: "werewolf" }, { gameId: "g", playerName: " ", roleId: "werewolf" },
    { gameId: "g", playerName: "Kien", roleId: null }, { gameId: 1, playerName: "Kien", roleId: "werewolf" },
    { gameId: "g", playerName: {}, roleId: "werewolf" }, { gameId: "g", playerName: "Kien", roleId: [] },
    { gameId: "g", playerName: "Kien", roleId: "unknown" }, { gameId: "g", playerName: "Kien", roleId: "WEREWOLF" },
    { gameId: "g", playerName: "Kien", roleId: " werewolf" },
  ])("rejects invalid start payload %# safely", value => expect(parseStartGameEvent(value)).toBeNull())

  it("fails safely when the role catalog lookup is empty", () => { expect(isRoleId("werewolf", [])).toBe(false) })

  it("rejects inherited start values and handles long opaque fields", () => {
    const inherited = Object.create({ gameId: "game-001" }); Object.assign(inherited, { playerName: "Kien", roleId: "werewolf" })
    expect(parseStartGameEvent(inherited)).toBeNull()
    const gameId = "g".repeat(100_000), playerName = "p".repeat(100_000)
    expect(parseStartGameEvent({ gameId, playerName, roleId: approvedRoleIds[0] })).toEqual({ gameId, playerName, roleId: approvedRoleIds[0] })
    expect(String(parseStartGameEvent({ gameId: "secret-game", playerName: "Secret", roleId: "unknown" }))).not.toContain("secret-game")
  })

  it("accepts exact end objects and JSON", () => {
    expect(parseEndGameEvent({ gameId: "game-001" })).toEqual({ gameId: "game-001" })
    expect(parseEndGameEvent('{"gameId":"game-001"}')).toEqual({ gameId: "game-001" })
    expect(parseEndGameEvent({ gameId: "game-001", winningSide: "VILLAGE", roles: [{ roleId: "seer", quantity: 1 }] }))
      .toEqual({ gameId: "game-001", winningSide: "VILLAGE", roles: [{ roleId: "seer", quantity: 1 }] })
  })

  it.each([undefined, null, [], 1, true, "bad", {}, { gameId: "" }, { gameId: " " }, { gameId: null }, { gameId: 1 }, { GameId: "g" }, { gameId: "g", extra: true }])
  ("rejects invalid end payload %# safely", value => expect(parseEndGameEvent(value)).toBeNull())
})
