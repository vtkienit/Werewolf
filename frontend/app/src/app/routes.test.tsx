import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AppRoutes from "./routes"
import { playerSessionKey } from "../config/playerSessionStorage"
import { LanguageProvider } from "../contexts/LanguageProvider"

type RouteSocketCallbacks = {
  onStartGame: (event: { gameId: string; playerName: string; roleId: "werewolf" }) => void
}

const socket = vi.hoisted(() => ({
  callbacks: null as RouteSocketCallbacks | null,
  create: vi.fn((_room: string, _session: unknown, callbacks: RouteSocketCallbacks) => {
    socket.callbacks = callbacks
    return { activate: vi.fn(), deactivate: vi.fn().mockResolvedValue(undefined) }
  }),
}))
vi.mock("../config/playerSocket", () => ({ createLobbyClient: socket.create, deactivateLobbyClient: vi.fn((client: { deactivate: () => Promise<void> }) => client.deactivate()) }))
vi.mock("../features/host-room/realtime/hostRoomSocket", () => ({ createHostRoomClient: vi.fn(() => ({ activate: vi.fn() })), deactivateHostRoomClient: vi.fn() }))
vi.mock("qrcode.react", () => ({ QRCodeSVG: ({ value }: { value: string }) => <svg data-value={value} /> }))

function renderRoute(path: string) {
  window.history.pushState({}, "", path)
  return render(<LanguageProvider><AppRoutes /></LanguageProvider>)
}

describe("AppRoutes", () => {
  beforeEach(() => { sessionStorage.clear(); socket.create.mockClear(); socket.callbacks = null })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    window.history.pushState({}, "", "/")
  })

  it("renders Home, Create Room, the existing Host Room route, and wildcard error", () => {
    const home = renderRoute("/")
    expect(screen.getByRole("heading", { name: /Ma Sói Online/i })).toBeInTheDocument()
    expect(screen.getAllByRole("banner")).toHaveLength(1)
    expect(screen.getByRole("link", { name: "Cách chơi" })).toHaveAttribute("href", "/#how-to-play")
    home.unmount()
    const create = renderRoute("/host/create")
    expect(screen.getByRole("heading", { name: /Tạo phòng mới/i })).toBeInTheDocument()
    create.unmount()
    sessionStorage.setItem("masoi.host.rooms.A7K9Q2.hostId", "host-id")
    const host = renderRoute("/host/rooms/A7K9Q2")
    expect(screen.getByRole("heading", { name: "Phòng Host" })).toBeInTheDocument()
    expect(screen.getAllByText("A7K9Q2").length).toBeGreaterThan(0)
    host.unmount()
    renderRoute("/not-an-approved-route")
    expect(screen.getByRole("heading", { name: /Không tìm thấy trang/i })).toBeInTheDocument()
  })

  it("renders the dedicated How-to-Play page on direct hash navigation", () => {
    renderRoute("/#how-to-play")
    expect(screen.getByRole("heading", { name: "Cách chơi" })).toBeInTheDocument()
    expect(screen.getAllByRole("banner")).toHaveLength(1)
  })

  it("opens How to play as a normal history entry so Browser Back returns naturally", async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify({ roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "token" }))
    renderRoute("/player/A7K9Q2")
    await user.click(screen.getByRole("link", { name: "Cách chơi" }))
    expect(screen.getByRole("heading", { name: "Cách chơi" })).toBeInTheDocument()
    act(() => window.history.back())
    await waitFor(() => expect(screen.getByRole("heading", { name: /Đang chờ Host/i })).toBeInTheDocument())
  })

  it("keeps player waiting and card routes nested without changing join or host paths", () => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify({ roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "token" }))
    const waiting = renderRoute("/player/A7K9Q2")
    expect(screen.getByRole("heading", { name: /Đang chờ Host/i })).toBeInTheDocument()
    waiting.unmount()
    renderRoute("/player/A7K9Q2/card")
    expect(screen.getByRole("heading", { name: /Đang chờ Host/i })).toBeInTheDocument()
    expect(socket.create).toHaveBeenCalledTimes(2)
  })

  it("renders Player Join and reaches the nested private card after an accepted Start event", async () => {
    const join = renderRoute("/join/A7K9Q2")
    expect(screen.getByRole("form", { name: "Tham gia phòng" })).toBeInTheDocument()
    expect(screen.getByText("Phòng A7K9Q2")).toBeInTheDocument()
    join.unmount()

    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify({ roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "token" }))
    renderRoute("/player/A7K9Q2")
    act(() => socket.callbacks!.onStartGame({ gameId: "game-1", playerName: "An", roleId: "werewolf" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Lá bài vai trò riêng tư" })).toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument()
  })

  it("registers protected Setup and Round Note routes", () => {
    sessionStorage.setItem("masoi.host.rooms.A7K9Q2.hostId", "host-id")
    const setup = renderRoute("/host/rooms/A7K9Q2/setup")
    expect(screen.getByRole("heading", { name: "Thiết lập ván đấu" })).toBeInTheDocument()
    setup.unmount()
    renderRoute("/host/rooms/A7K9Q2/round-note")
    expect(screen.getByText("Không có ván đã hoàn thành để xem lại.")).toBeInTheDocument()
  })

  it("protects Host feature routes with canonical Room codes and the existing session", () => {
    const missing = renderRoute("/host/rooms/A7K9Q2/setup")
    expect(screen.getByRole("alert")).toHaveTextContent("Tab trình duyệt này không còn quyền Host.")
    missing.unmount()
    renderRoute("/host/rooms/not-valid/round-note")
    expect(screen.getByRole("alert")).toHaveTextContent("Tab trình duyệt này không còn quyền Host.")
    expect(window.location.search).toBe("")
  })
  it("creates a room, stores only the credential before navigation, and reaches the Host shell", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      roomCode: "A7K9Q2",
      hostId: "exact-host-id",
      qrUrl: "http://localhost/join/A7K9Q2",
    }), { status: 201, headers: { "Content-Type": "application/json" } })))
    renderRoute("/host/create")
    await user.click(screen.getByRole("button", { name: /Tạo phòng/i }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Phòng Host" })).toBeInTheDocument())
    expect(sessionStorage.getItem("masoi.host.rooms.A7K9Q2.hostId")).toBe("exact-host-id")
    expect(Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index))).toEqual(["masoi.host.rooms.A7K9Q2.hostId"])
    expect(JSON.stringify(sessionStorage)).not.toContain("qrUrl")
  })
})
