import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import HostRoomPage from "./HostRoomPage"
import HostGameSetupPage from "./HostGameSetupPage"

const socket = vi.hoisted(() => ({ callback: null as null | ((value: any) => void), endCallback: null as null | (() => void), activate: vi.fn(), deactivate: vi.fn().mockResolvedValue(undefined) }))
vi.mock("../realtime/hostRoomSocket", () => ({
  createHostRoomClient: vi.fn((_roomCode: string, _hostId: string, callback: (value: any) => void, endCallback: () => void) => { socket.callback = callback; socket.endCallback = endCallback; return { activate: socket.activate } }),
  deactivateHostRoomClient: socket.deactivate,
}))
vi.mock("qrcode.react", () => ({ QRCodeSVG: ({ value }: { value: string }) => <svg data-value={value} /> }))

function Location() { return <output>{useLocation().pathname}</output> }
function renderPage(path = "/host/rooms/A7K9Q2") {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/host/rooms/:roomCode" element={<><HostRoomPage /><Location /></>}><Route index element={<HostGameSetupPage />} /><Route path="round-note" element={<p>Round note view</p>} /></Route></Routes></MemoryRouter>)
}

describe("HostRoomPage", () => {
  beforeEach(() => { sessionStorage.clear(); sessionStorage.setItem("masoi.host.rooms.A7K9Q2.hostId", "secret-host-id"); vi.stubGlobal("fetch", vi.fn()) })
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); socket.callback = null; socket.endCallback = null })

  it("returns the Host to the canonical Room when authoritative End arrives", () => {
    renderPage("/host/rooms/A7K9Q2/round-note")
    act(() => socket.callback?.({ roomCode: "A7K9Q2", status: "PLAYING", currentPlayers: 6, maxPlayers: 6, players: [] }))
    act(() => socket.endCallback?.())
    expect(screen.getByText("/host/rooms/A7K9Q2")).toBeInTheDocument()
  })

  it("creates one Host-safe client and renders the public snapshot", () => {
    const view = renderPage()
    expect(socket.activate).toHaveBeenCalledTimes(1)
    act(() => socket.callback?.({ roomCode: "A7K9Q2", status: "WAITING", currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "p1", playerName: "Player One", isConnected: true, ready: false }] }))
    expect(screen.getByText(/Player One/)).toBeInTheDocument()
    expect(document.body.textContent).not.toContain("secret-host-id")
    view.unmount()
    expect(socket.deactivate).toHaveBeenCalledTimes(1)
  })

  it("renders a safe access error without creating a socket when the credential is missing", () => {
    sessionStorage.clear()
    renderPage()
    expect(screen.getByRole("alert")).toHaveTextContent("Tab trình duyệt này không còn quyền Host.")
    expect(socket.activate).not.toHaveBeenCalled()
  })

  it("ignores and clears stale persisted PLAYING on a fresh Host mount", () => {
    sessionStorage.setItem("masoi.host.rooms.A7K9Q2.lifecycle", "PLAYING")
    sessionStorage.setItem("masoi.host.rooms.B8M2P4.lifecycle", "PLAYING")
    renderPage()
    act(() => socket.callback?.({ roomCode: "A7K9Q2", status: "WAITING", currentPlayers: 6, maxPlayers: 6, players: Array.from({ length: 6 }, (_, index) => ({ playerId: `p${index}`, playerName: `Player ${index}`, isConnected: true, ready: true })) }))
    expect(screen.getByRole("button", { name: "Tăng số người chơi tối đa" })).toBeEnabled()
    const werewolfInput = screen.getByRole("spinbutton", { name: "Số lượng Ma Sói" })
    const werewolfControls = within(werewolfInput.parentElement!)
    expect(werewolfInput).toBeEnabled()
    expect(werewolfControls.getByTitle("Giảm số lượng")).toBeEnabled()
    expect(werewolfControls.getByTitle("Tăng số lượng")).toBeEnabled()
    expect(screen.getByRole("button", { name: "Xác nhận thiết lập" })).toBeEnabled()
    expect(screen.queryByRole("button", { name: "End game" })).toBeNull()
    expect(sessionStorage.getItem("masoi.host.rooms.A7K9Q2.lifecycle")).toBeNull()
    expect(sessionStorage.getItem("masoi.host.rooms.B8M2P4.lifecycle")).toBe("PLAYING")
    expect(fetch).not.toHaveBeenCalled()
  })

  it("normalizes fractional numeric input before increment and decrement", () => {
    renderPage()
    act(() => socket.callback?.({ roomCode: "A7K9Q2", status: "WAITING", currentPlayers: 6, maxPlayers: 6, players: Array.from({ length: 6 }, (_, index) => ({ playerId: `p${index}`, playerName: `Player ${index}`, isConnected: true, ready: true })) }))
    const input = screen.getByRole("spinbutton", { name: "Số lượng Ma Sói" })
    const controls = within(input.parentElement!)
    fireEvent.change(input, { target: { value: "2.9" } })
    expect(input).toHaveValue(2)
    fireEvent.click(controls.getByTitle("Tăng số lượng")); expect(input).toHaveValue(3)
    fireEvent.click(controls.getByTitle("Giảm số lượng")); expect(input).toHaveValue(2)
  })
})
