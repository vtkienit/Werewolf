import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import PlayerCardPage from "../pages/PlayerCardPage"
import { PlayerRouteContext, type PlayerRouteContextValue } from "../pages/PlayerRoomPage"
import { initialPlayerGameState, reducePlayerGameState } from "../config/playerGameState"
import { parseStartGameEvent } from "../config/playerGameTypes"
import { LanguageProvider } from "../contexts/LanguageProvider"
import LanguageToggle from "../components/LanguageToggle"

const start = parseStartGameEvent({ gameId: "game-1", playerName: "An", roleId: "werewolf" })!
const hidden = reducePlayerGameState(initialPlayerGameState, { type: "START", event: start })

function renderPage(overrides: Partial<PlayerRouteContextValue> = {}) {
  const value: PlayerRouteContextValue = {
    roomCode: "A7K9Q2",
    player: { playerId: "player-a", playerName: "An" },
    snapshot: null,
    connectionState: "Connected",
    gameState: hidden,
    revealRole: vi.fn(),
    hideRole: vi.fn(),
    returnToWaiting: vi.fn(),
    ...overrides,
  }
  return { value, ...render(<PlayerRouteContext.Provider value={value}><MemoryRouter initialEntries={["/player/A7K9Q2/card"]}><Routes><Route path="/player/:roomCode/card" element={<PlayerCardPage />} /><Route path="/player/:roomCode" element={<p>Waiting route</p>} /></Routes></MemoryRouter></PlayerRouteContext.Provider>) }
}

afterEach(cleanup)

describe("PlayerCardPage", () => {
  it("starts hidden and uses reducer-owned reveal, hide, and review actions", async () => {
    const user = userEvent.setup()
    const first = renderPage()
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument()
    expect(screen.queryByText("Ma Sói")).toBeNull()
    expect(first.container.innerHTML).not.toMatch(/werewolf|ma sói|\/roles\//i)
    expect(first.container.innerHTML).not.toContain("border-rose-400/40")
    await user.click(screen.getByRole("button", { name: "Xem vai trò" }))
    expect(first.value.revealRole).toHaveBeenCalledOnce()
    first.unmount()

    const revealed = reducePlayerGameState(hidden, { type: "REVEAL" })
    const second = renderPage({ gameState: revealed })
    expect(screen.getByRole("heading", { name: "Ma Sói" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Ma Sói" })).toHaveAttribute("src", "/roles/werewolf.webp")
    await user.click(screen.getByRole("button", { name: "Ẩn vai trò" }))
    expect(second.value.hideRole).toHaveBeenCalledOnce()
    second.unmount()

    renderPage({ gameState: reducePlayerGameState(revealed, { type: "HIDE" }), connectionState: "Reconnecting" })
    expect(screen.getByRole("button", { name: "Xem lại vai trò" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting")
  })

  it("redirects direct or browser-back access after the assignment is cleared", () => {
    renderPage({ gameState: initialPlayerGameState })
    expect(screen.getByText("Waiting route")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /role/i })).toBeNull()
  })

  it("switches the revealed role name and detailed ability to English", async () => {
    const revealed = reducePlayerGameState(hidden, { type: "REVEAL" })
    const value: PlayerRouteContextValue = {
      roomCode: "A7K9Q2",
      player: { playerId: "player-a", playerName: "An" },
      snapshot: null,
      connectionState: "Connected",
      gameState: revealed,
      revealRole: vi.fn(),
      hideRole: vi.fn(),
      returnToWaiting: vi.fn(),
    }
    render(<LanguageProvider><PlayerRouteContext.Provider value={value}><MemoryRouter><PlayerCardPage /><LanguageToggle /></MemoryRouter></PlayerRouteContext.Provider></LanguageProvider>)
    expect(screen.getByText(/cả bầy Sói cùng thống nhất/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))
    expect(screen.getByRole("heading", { name: "Werewolf" })).toBeInTheDocument()
    expect(screen.getByText(/Werewolves agree on one player to devour/i)).toBeInTheDocument()
    expect(screen.queryByText(/cả bầy Sói cùng thống nhất/i)).toBeNull()
  })
})
