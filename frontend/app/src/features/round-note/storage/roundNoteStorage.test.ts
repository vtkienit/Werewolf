import { beforeEach, describe, expect, it } from "vitest"
import { archiveGameReview, beginGameReviewSession, confirmCurrentRound, loadActiveGameReview, loadLatestCompletedGameReview, roundNoteStorageKey, updatePlayerRoundNote } from "./roundNoteStorage"

const assignments = [
  { playerId: "p1", playerName: "Trung", roleId: "seer", roleName: "Seer" },
  { playerId: "p2", playerName: "Trung", roleId: "villager", roleName: "Villager" },
]

describe("versioned Player Round Note storage", () => {
  beforeEach(() => localStorage.clear())

  it("keys duplicate names by playerId and confirms fresh sequential rounds", () => {
    beginGameReviewSession("A7K9Q2", "game-1", assignments)
    updatePlayerRoundNote("A7K9Q2", "game-1", "p1", "seer note")
    let session = updatePlayerRoundNote("A7K9Q2", "game-1", "p2", "villager note")!
    expect(session.currentRound.playerNotes.map(note => [note.playerId, note.text])).toEqual([["p1", "seer note"], ["p2", "villager note"]])
    expect(session.currentRound.playerNotes.map(note => note.playerDisambiguator)).toEqual(["Player 1", "Player 2"])
    session = confirmCurrentRound("A7K9Q2", "game-1")!
    expect(session.rounds[0].playerNotes.map(note => note.text)).toEqual(["seer note", "villager note"])
    expect(session.currentRound.roundNumber).toBe(2)
    expect(session.currentRound.playerNotes.every(note => note.text === "")).toBe(true)
  })

  it("isolates Rooms and game sessions and archives a winner for read-only review", () => {
    beginGameReviewSession("A7K9Q2", "game-1", assignments)
    updatePlayerRoundNote("A7K9Q2", "game-1", "p1", "room A")
    beginGameReviewSession("B8M2P4", "game-2", assignments)
    expect(loadActiveGameReview("B8M2P4").session?.gameSessionId).toBe("game-2")
    expect(archiveGameReview("A7K9Q2", "game-1", "VILLAGE")).toBe(true)
    expect(loadActiveGameReview("A7K9Q2").session).toBeNull()
    expect(loadLatestCompletedGameReview("A7K9Q2")).toMatchObject({ gameSessionId: "game-1", winningSide: "VILLAGE", completed: true })
    expect(loadLatestCompletedGameReview("B8M2P4")).toBeNull()
  })

  it("fails safely for malformed or unavailable storage", () => {
    localStorage.setItem(roundNoteStorageKey("A7K9Q2"), "{broken")
    expect(loadActiveGameReview("A7K9Q2")).toEqual({ session: null, error: "Round Note storage is unavailable." })
  })
})
