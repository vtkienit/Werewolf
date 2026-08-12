import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import GameSetupPanel from "./GameSetupPanel"
import type { HostGameController } from "../hooks/useHostGame"
import { LanguageProvider } from "../../../contexts/LanguageProvider"
import LanguageToggle from "../../../components/LanguageToggle"

const players = [{ playerId: "p1", playerName: "Player One" }]
const roles = [{ roleId: "werewolf", name: "Werewolf", team: "werewolf" }]
function controller(overrides: Partial<HostGameController> = {}): HostGameController {
  return { quantities: { werewolf: 1 }, selectedRoleCount: 1, lifecycle: "WAITING", status: "IDLE", statusMessage: "", isRoleSetupValid: true, canConfirmRoleSetup: true, areAllPlayersReady: false, canStart: false, setupConfirmed: false, pending: false, active: false, assignments: [], gameSessionId: null, winnerOptions: [], winningSide: "", updateQuantity: vi.fn(), recommend: vi.fn(), confirmRoleSetup: vi.fn().mockReturnValue(true), setWinningSide: vi.fn(), start: vi.fn().mockResolvedValue(true), end: vi.fn().mockResolvedValue(true), reconcileEnded: vi.fn(), ...overrides }
}

describe("GameSetupPanel", () => {
  afterEach(cleanup)
  it("confirms a valid setup without starting the game", async () => {
    const game = controller(); const onStarted = vi.fn()
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={game} onStarted={onStarted} />)
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận thiết lập" }))
    await waitFor(() => expect(game.confirmRoleSetup).toHaveBeenCalledTimes(1))
    expect(game.start).not.toHaveBeenCalled()
    expect(onStarted).toHaveBeenCalledTimes(1)
  })
  it("renders production role artwork and concise canonical metadata", () => {
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={controller()} />)
    expect(screen.getByRole("complementary", { name: "Tóm tắt thiết lập" })).toBeInTheDocument()
    const library = screen.getByRole("region", { name: "Thư viện vai trò" })
    expect(within(library).queryByRole("img", { name: "Ma Sói" })).toBeNull()
    expect(screen.getByRole("complementary", { name: "Tóm tắt thiết lập" })).toContainElement(screen.getByRole("img", { name: "Ma Sói" }))
    expect(screen.getByRole("heading", { name: "Ma Sói" })).toBeInTheDocument()
    expect(screen.getByText("Werewolf")).toBeInTheDocument()
    expect(screen.getAllByText("Sói").length).toBeGreaterThan(0)
    expect(screen.getByText(/cả bầy Sói cùng thống nhất/i)).toBeInTheDocument()
  })
  it("locks preparation controls while PLAYING and exposes no End action in Setup", () => {
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={controller({ lifecycle: "PLAYING", active: true, canStart: false })} />)
    expect(screen.getByRole("spinbutton", { name: "Số lượng Ma Sói" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Xác nhận thiết lập" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "End game" })).toBeNull()
  })

  it("exposes pending controls without navigating", () => {
    const game = controller({ status: "START_REQUEST_PENDING", pending: true, canConfirmRoleSetup: false, start: vi.fn().mockResolvedValue(false) })
    const onStarted = vi.fn()
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={game} onStarted={onStarted} />)
    expect(screen.getByRole("button", { name: "Xác nhận thiết lập" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "End game" })).toBeNull()
    expect(onStarted).not.toHaveBeenCalled()
  })

  it("uses balanced compact, quantity, delete, and CTA button tiers", () => {
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={controller()} />)
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveClass("ww-button-compact")
    expect(screen.getByRole("button", { name: "Thêm Ma Sói" })).toHaveClass("ww-button-compact")
    expect(screen.getByRole("button", { name: "Giảm Ma Sói" })).toHaveClass("ww-quantity-button")
    expect(screen.getByRole("button", { name: "Tăng Ma Sói" })).toHaveClass("ww-quantity-button")
    expect(screen.getByRole("button", { name: "Xóa Ma Sói" })).toHaveClass("ww-delete-button")
    expect(screen.getByRole("button", { name: "Xác nhận thiết lập" })).toHaveClass("ww-button-cta")
  })

  it("offers recommendation as one compact action without a player-count field", () => {
    const game = controller()
    render(<GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={game} />)

    expect(screen.queryByText("Gợi ý thiết lập")).not.toBeInTheDocument()
    expect(screen.queryByText("người", { exact: true })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Gợi ý" }))
    expect(game.recommend).toHaveBeenCalledTimes(1)
  })

  it("switches Game Setup body labels and role names to English", () => {
    render(<LanguageProvider><GameSetupPanel roomCode="ABC123" players={players} roles={roles} game={controller()} /><LanguageToggle /></LanguageProvider>)
    expect(screen.getByRole("heading", { name: "Quản Trò Ma Sói" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))
    expect(screen.getByRole("heading", { name: "Werewolf Host Console" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Werewolf" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Confirm setup" })).toBeInTheDocument()
  })
})
