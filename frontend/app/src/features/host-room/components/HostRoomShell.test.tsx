import { cleanup, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import HostRoomShell from "./HostRoomShell"
import type { HostRoomPresentation } from "../types/hostRoomShell"
import type { HostGameController } from "../../game-setup/hooks/useHostGame"

vi.mock("qrcode.react", () => ({ QRCodeSVG: ({ value, role, "aria-label": label }: { value: string; role?: string; "aria-label"?: string }) => <svg data-value={value} role={role} aria-label={label} /> }))
const presentation: HostRoomPresentation = { status: "waiting", roomCode: "A7K9Q2", joinUrl: "https://example.test/join/A7K9Q2", error: null, isMockStatus: false }
const maxPlayersControl = { confirmedMaxPlayers: 6, playerCount: 1, draft: 6, onDraftChange: vi.fn(), loading: false, error: null, canSubmit: false, onSubmit: vi.fn() }
const snapshot = { roomCode: "A7K9Q2", status: "WAITING" as const, currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "p1", playerName: "Player One", isConnected: true }] }
const game: HostGameController = { quantities: { werewolf: 1 }, selectedRoleCount: 1, lifecycle: "WAITING", status: "IDLE", statusMessage: "", isRoleSetupValid: true, canConfirmRoleSetup: true, areAllPlayersReady: false, canStart: false, setupConfirmed: true, pending: false, active: false, assignments: [], gameSessionId: null, winnerOptions: [], winningSide: "", updateQuantity: vi.fn(), recommend: vi.fn(), confirmRoleSetup: vi.fn().mockResolvedValue(true), setWinningSide: vi.fn(), start: vi.fn().mockResolvedValue(false), end: vi.fn().mockResolvedValue(false), reconcileEnded: vi.fn() }

describe("HostRoomShell", () => {
  afterEach(cleanup)
  it("renders real Players, route content, and canonical navigation", () => {
    render(<MemoryRouter><HostRoomShell presentation={presentation} maxPlayersControl={maxPlayersControl} snapshot={snapshot} gameActive={false} routeContent={<h2>Game setup</h2>} /></MemoryRouter>)
    expect(screen.getByText(/Player One/)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Game setup" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Thiết lập vai trò" })).toHaveAttribute("href", "/host/rooms/A7K9Q2/setup")
    const overview = screen.getByTestId("host-room-overview")
    const controls = within(overview).getByRole("complementary", { name: "Điều khiển phòng Host" })
    expect(within(overview).getByRole("region", { name: "Người chơi trong phòng" })).toBeInTheDocument()
    expect(within(controls).getByRole("region", { name: "Thông tin phòng" })).toBeInTheDocument()
    expect(within(controls).getByRole("link", { name: "Thiết lập vai trò" })).toBeInTheDocument()
    expect(within(overview).getByRole("button", { name: "Sao chép mã phòng" })).toBeInTheDocument()
    expect(within(overview).getByRole("button", { name: "Sao chép liên kết tham gia" })).toBeInTheDocument()
    expect(within(overview).getByRole("img", { name: "Mã QR để tham gia phòng" })).toBeInTheDocument()
    const copyCode = within(overview).getByRole("button", { name: "Sao chép mã phòng" })
    const copyLink = within(overview).getByRole("button", { name: "Sao chép liên kết tham gia" })
    expect(copyCode.className).toBe(copyLink.className)
  })

  it("keeps Start, Review, and Active Roles in the approved order", () => {
    render(<MemoryRouter><HostRoomShell presentation={presentation} maxPlayersControl={maxPlayersControl} snapshot={snapshot} gameActive={false} routeContent={null} hasReview game={game} roles={[{ roleId: "werewolf", name: "Werewolf", team: "werewolf", maxQuantity: 10 }]} /></MemoryRouter>)
    const start = screen.getByRole("button", { name: "Bắt đầu ván" })
    const review = screen.getByRole("link", { name: "Xem lại ván trước" })
    const active = screen.getByRole("heading", { name: "Vai trò đang dùng" })
    expect(screen.getByRole("link", { name: "Thiết lập vai trò" })).toHaveClass("ww-button-cta")
    expect(start).toHaveClass("ww-button-cta")
    expect(start.compareDocumentPosition(review) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(review.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
