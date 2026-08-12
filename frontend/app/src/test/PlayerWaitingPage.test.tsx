import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import PlayerWaitingPage from "../pages/PlayerWaitingPage"
import { PlayerRouteContext, type PlayerRouteContextValue } from "../pages/PlayerRoomPage"
import { initialPlayerGameState } from "../config/playerGameState"

vi.mock("../config/playerSocket", () => ({ createLobbyClient: vi.fn(() => { throw new Error("waiting page must not create sockets") }) }))

const snapshot = { roomCode: "A7K9Q2", status: "WAITING" as const, currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "player-a", playerName: "An", isConnected: true, ready: false }] }

afterEach(cleanup)

describe("PlayerWaitingPage", () => {
  it("presents parent context snapshot, identity, and connection status", () => {
    const value: PlayerRouteContextValue = { roomCode: "A7K9Q2", player: { playerId: "player-a", playerName: "An" }, snapshot, connectionState: "Connected", gameState: initialPlayerGameState, revealRole: vi.fn(), hideRole: vi.fn(), returnToWaiting: vi.fn() }
    render(<PlayerRouteContext.Provider value={value}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)

    expect(screen.getByRole("heading", { name: "Đang chờ Host" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Đã kết nối")
    expect(screen.getByText(/An \(bạn\)/)).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Vai trò đang dùng" })).toBeInTheDocument()
    const overview = screen.getByTestId("player-room-overview")
    const controls = within(overview).getByRole("complementary", { name: "Điều khiển phòng người chơi" })
    expect(within(overview).getByRole("region", { name: "Người chơi trong phòng" })).toBeInTheDocument()
    expect(within(controls).getByRole("region", { name: "Thông tin phòng" })).toBeInTheDocument()
    expect(within(overview).getByRole("button", { name: "Sao chép mã phòng" })).toBeInTheDocument()
    expect(within(overview).getByRole("button", { name: "Sao chép liên kết tham gia" })).toBeInTheDocument()
    expect(within(overview).getByRole("img", { name: "Mã QR để tham gia phòng" })).toBeInTheDocument()
    expect(screen.getByText("Host chưa xác nhận thiết lập vai trò.")).toBeInTheDocument()
    expect(screen.queryByText("Sói")).toBeNull()
    expect(screen.queryByText("Phù thủy")).toBeNull()
    expect(screen.queryByRole("link", { name: /setup/i })).toBeNull()
    expect(screen.queryByRole("button", { name: /start game/i })).toBeNull()
  })

  it("renders authoritative Active Roles and a privacy-safe previous review in the approved order", async () => {
    const publicSnapshot = { ...snapshot, activeRoles: [{ roleId: "seer", quantity: 1 }], lastCompletedGame: { winningSide: "VILLAGE", roles: [{ roleId: "werewolf", quantity: 2 }] } }
    const value: PlayerRouteContextValue = { roomCode: "A7K9Q2", player: { playerId: "player-a", playerName: "An" }, snapshot: publicSnapshot, connectionState: "Connected", gameState: initialPlayerGameState, revealRole: vi.fn(), hideRole: vi.fn(), returnToWaiting: vi.fn(), setReady: vi.fn(), readyPending: false, readyError: "" }
    render(<PlayerRouteContext.Provider value={value}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)
    const ready = screen.getByRole("button", { name: "Sẵn sàng" })
    const review = screen.getByRole("button", { name: /Xem lại ván trước/ })
    const active = screen.getByRole("heading", { name: "Vai trò đang dùng" })
    expect(ready.compareDocumentPosition(review) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(review.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Tiên Tri" })).toBeInTheDocument()
    await userEvent.click(review)
    expect(screen.getByRole("heading", { name: "Xem lại ván trước" })).toBeInTheDocument()
    expect(screen.getByText("Phe chiến thắng: VILLAGE")).toBeInTheDocument()
    expect(screen.getByLabelText("Số lượng 2")).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Host Notes|player-a.*werewolf/i)
  })

  it("renders one stateful Ready control and updates only the current Player intent", async () => {
    const setReady = vi.fn().mockResolvedValue(undefined)
    const value: PlayerRouteContextValue = { roomCode: "A7K9Q2", player: { playerId: "player-a", playerName: "An" }, snapshot, connectionState: "Connected", gameState: initialPlayerGameState, revealRole: vi.fn(), hideRole: vi.fn(), returnToWaiting: vi.fn(), setReady, readyPending: false, readyError: "" }
    render(<PlayerRouteContext.Provider value={value}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)
    expect(screen.getAllByRole("button", { name: "Sẵn sàng" })).toHaveLength(1)
    await userEvent.click(screen.getByRole("button", { name: "Sẵn sàng" }))
    expect(setReady).toHaveBeenCalledWith(true)
  })

  it("keeps Ready, completed, and loading states on one balanced semantic button", () => {
    const baseValue: PlayerRouteContextValue = { roomCode: "A7K9Q2", player: { playerId: "player-a", playerName: "An" }, snapshot, connectionState: "Connected", gameState: initialPlayerGameState, revealRole: vi.fn(), hideRole: vi.fn(), returnToWaiting: vi.fn(), setReady: vi.fn(), readyPending: false, readyError: "" }
    const waiting = render(<PlayerRouteContext.Provider value={baseValue}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)
    const unready = screen.getByRole("button", { name: "Sẵn sàng" })
    expect(unready).toHaveClass("ww-ready-control")
    expect(unready).toHaveTextContent("Sẵn sàng")
    expect(unready).toHaveTextContent("Xác nhận bạn đã sẵn sàng bắt đầu ván.")
    expect(unready.querySelector("svg + span")).toBeInTheDocument()
    waiting.unmount()

    const readySnapshot = { ...snapshot, players: [{ ...snapshot.players[0], ready: true }] }
    const completed = render(<PlayerRouteContext.Provider value={{ ...baseValue, snapshot: readySnapshot }}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)
    const ready = screen.getByRole("button", { name: "Đã sẵn sàng" })
    expect(ready).toHaveClass("ww-ready-control", "ww-ready-control--ready")
    expect(ready).toHaveTextContent("Nhấn để hủy trạng thái sẵn sàng.")
    expect(ready.querySelector("svg + span")).toBeInTheDocument()
    completed.unmount()

    render(<PlayerRouteContext.Provider value={{ ...baseValue, readyPending: true }}><MemoryRouter><PlayerWaitingPage /></MemoryRouter></PlayerRouteContext.Provider>)
    const loading = screen.getByRole("button", { name: "Đang cập nhật trạng thái sẵn sàng" })
    expect(loading).toBeDisabled()
    expect(loading).toHaveTextContent("Đang cập nhật...")
    expect(loading.querySelector("svg + span")).toBeInTheDocument()
  })
})
