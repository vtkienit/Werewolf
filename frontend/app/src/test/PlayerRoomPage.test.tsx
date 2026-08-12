import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import PlayerRoomPage from "../pages/PlayerRoomPage"
import PlayerWaitingPage from "../pages/PlayerWaitingPage"
import PlayerCardPage from "../pages/PlayerCardPage"
import { playerSessionKey } from "../config/playerSessionStorage"
import { parseStartGameEvent } from "../config/playerGameTypes"

const socket = vi.hoisted(() => ({ clients: [] as Array<any>, create: vi.fn(), deactivate: vi.fn((client: any) => client.deactivate()) }))
vi.mock("../config/playerSocket", () => ({ createLobbyClient: socket.create, deactivateLobbyClient: socket.deactivate }))

const session = { roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "secret-token" }
const snapshot = { roomCode: "A7K9Q2", status: "WAITING" as const, currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "player-a", playerName: "An", isConnected: true }] }
const start = parseStartGameEvent({ gameId: "game-1", playerName: "An", roleId: "werewolf" })!

function renderPage(path = "/player/A7K9Q2") {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/" element={<p>Home route</p>} /><Route path="/join/:roomCode" element={<p>Join route</p>} /><Route path="/player/:roomCode" element={<PlayerRoomPage />}><Route index element={<PlayerWaitingPage />} /><Route path="card" element={<PlayerCardPage />} /></Route></Routes></MemoryRouter>)
}

describe("PlayerRoomPage lifecycle", () => {
  beforeEach(() => {
    sessionStorage.clear()
    socket.clients.length = 0
    socket.create.mockImplementation((_room: string, _session: unknown, callbacks: unknown) => {
      const client = { activate: vi.fn(), deactivate: vi.fn().mockResolvedValue(undefined), callbacks }
      socket.clients.push(client)
      return client
    })
  })
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it("owns one socket, keeps snapshots on reconnect, and ignores callbacks after cleanup", () => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify(session))
    const view = renderPage()
    const client = socket.clients[0]
    expect(socket.clients).toHaveLength(1)
    expect(client.activate).toHaveBeenCalledOnce()
    act(() => client.callbacks.onSnapshot(snapshot))
    expect(screen.getByText(/An \(bạn\)/)).toBeInTheDocument()
    act(() => client.callbacks.onTemporaryFailure())
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting")
    expect(screen.getByText(/An \(bạn\)/)).toBeInTheDocument()
    view.unmount()
    expect(client.deactivate).toHaveBeenCalledOnce()
    act(() => { client.callbacks.onStartGame(start); client.callbacks.onEndGame({ gameId: "game-1" }); client.callbacks.onAuthFailure() })
    expect(sessionStorage.getItem(playerSessionKey("A7K9Q2"))).not.toBeNull()
  })

  it("navigates only accepted starts and matching ends while preserving visibility on reconnect", async () => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify(session))
    renderPage()
    const callbacks = socket.clients[0].callbacks
    act(() => callbacks.onStartGame(start))
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument()
    act(() => callbacks.onStartGame(start))
    expect(screen.getAllByRole("button", { name: "Xem vai trò" })).toHaveLength(1)
    act(() => callbacks.onStartGame({ ...start, gameId: "game-2" }))
    act(() => callbacks.onEndGame({ gameId: "stale-game" }))
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument()
    act(() => callbacks.onTemporaryFailure())
    expect(screen.getByRole("button", { name: "Xem vai trò" })).toBeInTheDocument()
    act(() => callbacks.onEndGame({ gameId: "game-1" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Đang chờ Host" })).toBeInTheDocument())
  })

  it.each([false, true])("matching end clears and returns to waiting when revealed is %s", async revealed => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify(session))
    renderPage()
    const callbacks = socket.clients[0].callbacks
    act(() => callbacks.onStartGame(start))
    if (revealed) act(() => screen.getByRole("button", { name: "Xem vai trò" }).click())
    act(() => callbacks.onEndGame({ gameId: "game-1" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Đang chờ Host" })).toBeInTheDocument())
    expect(screen.queryByText("Ma Sói")).toBeNull()
  })

  it("clears matching session and role on terminal auth without touching another room", async () => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify(session))
    sessionStorage.setItem(playerSessionKey("B7K9Q2"), JSON.stringify({ ...session, roomCode: "B7K9Q2" }))
    renderPage()
    const client = socket.clients[0]
    act(() => client.callbacks.onStartGame(start))
    act(() => client.callbacks.onAuthFailure())
    await waitFor(() => expect(screen.getByText("Join route")).toBeInTheDocument())
    expect(sessionStorage.getItem(playerSessionKey("A7K9Q2"))).toBeNull()
    expect(sessionStorage.getItem(playerSessionKey("B7K9Q2"))).not.toBeNull()
    expect(client.deactivate).toHaveBeenCalledOnce()
    act(() => client.callbacks.onStartGame(start))
    expect(screen.queryByText("Ma Sói")).toBeNull()
  })

  it("rejects invalid routes, missing sessions, and mismatched stored sessions", () => {
    const invalid = renderPage("/player/invalid")
    expect(screen.getByText("Home route")).toBeInTheDocument()
    expect(socket.create).not.toHaveBeenCalled()
    invalid.unmount()

    const missing = renderPage()
    expect(screen.getByText("Join route")).toBeInTheDocument()
    missing.unmount()

    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify({ ...session, roomCode: "B7K9Q2" }))
    renderPage()
    expect(screen.getByText("Join route")).toBeInTheDocument()
    expect(socket.create).not.toHaveBeenCalled()
  })

  it("prevents callbacks from an older lifecycle changing a newer room", () => {
    sessionStorage.setItem(playerSessionKey("A7K9Q2"), JSON.stringify(session))
    const firstView = renderPage()
    const first = socket.clients[0]
    firstView.unmount()
    sessionStorage.setItem(playerSessionKey("B7K9Q2"), JSON.stringify({ ...session, roomCode: "B7K9Q2", playerId: "player-b", playerToken: "new-token" }))
    renderPage("/player/B7K9Q2")
    act(() => { first.callbacks.onStartGame(start); first.callbacks.onAuthFailure() })
    expect(screen.getByRole("heading", { name: "Đang chờ Host" })).toBeInTheDocument()
    expect(sessionStorage.getItem(playerSessionKey("B7K9Q2"))).not.toBeNull()
  })
})
