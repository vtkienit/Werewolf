import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import HostGameSetupPage from "./HostGameSetupPage"
import type { HostRoomRouteContext } from "./HostRoomPage"

const game = { quantities: { werewolf: 1 }, selectedRoleCount: 1, lifecycle: "WAITING" as const, status: "IDLE" as const, statusMessage: "", isRoleSetupValid: true, canConfirmRoleSetup: true, areAllPlayersReady: false, canStart: false, setupConfirmed: false, pending: false, active: false, assignments: [], gameSessionId: null, winnerOptions: [], winningSide: "", updateQuantity: vi.fn(), recommend: vi.fn(), confirmRoleSetup: vi.fn().mockReturnValue(true), setWinningSide: vi.fn(), start: vi.fn().mockResolvedValue(true), end: vi.fn().mockResolvedValue(true), reconcileEnded: vi.fn() }
const context: HostRoomRouteContext = { roomCode: "A7K9Q2", players: [{ playerId: "p1", playerName: "Player One" }], roles: [{ roleId: "werewolf", name: "Werewolf", team: "werewolf" }], game }

function Layout() { return <Outlet context={context} /> }

describe("HostGameSetupPage", () => {
  it("returns to Host Room after confirming setup without starting", async () => {
    render(<MemoryRouter initialEntries={["/host/rooms/A7K9Q2/setup"]}><Routes><Route path="/host/rooms/:roomCode" element={<Layout />}><Route index element={<h2>Host Room destination</h2>} /><Route path="setup" element={<HostGameSetupPage />} /></Route></Routes></MemoryRouter>)
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận thiết lập" }))
    await waitFor(() => expect(screen.getByRole("heading", { name: "Host Room destination" })).toBeInTheDocument())
    expect(game.confirmRoleSetup).toHaveBeenCalledTimes(1)
    expect(game.start).not.toHaveBeenCalled()
  })
})
