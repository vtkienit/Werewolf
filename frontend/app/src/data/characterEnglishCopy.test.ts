import { describe, expect, it } from "vitest"
import { characters } from "./characters"
import { characterEnglishCopy, localizedCharacterAbility, localizedCharacterScript } from "./characterEnglishCopy"

describe("character English copy", () => {
  it("provides English ability copy for every production role", () => {
    expect(Object.keys(characterEnglishCopy)).toHaveLength(characters.length)
    for (const character of characters) {
      expect(localizedCharacterAbility(character, "en").trim()).not.toBe("")
      expect(localizedCharacterAbility(character, "en")).not.toBe(character.ability)
    }
  })

  it("provides English Host scripts for every role that wakes at night", () => {
    for (const character of characters.filter(candidate => candidate.script)) {
      expect(localizedCharacterScript(character, "en").trim()).not.toBe("")
      expect(localizedCharacterScript(character, "en")).not.toBe(character.script)
    }
  })

  it("keeps Vietnamese as the default role copy", () => {
    const werewolf = characters.find(character => character.id === "werewolf")!
    expect(localizedCharacterAbility(werewolf, "vi")).toBe(werewolf.ability)
    expect(localizedCharacterScript(werewolf, "vi")).toBe(werewolf.script)
  })
})
