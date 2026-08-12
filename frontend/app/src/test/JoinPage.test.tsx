import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

const join = vi.hoisted(() => ({ joinRoom: vi.fn() }))
vi.mock("../config/playerJoinApi", () => ({ joinRoom: join.joinRoom }))

import JoinPage from "../pages/JoinPage"
import { playerSessionKey } from "../config/playerSessionStorage"

afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks() })

describe("JoinPage", () => {
  it("stores the validated player session before navigating without exposing its token", async () => {
    join.joinRoom.mockResolvedValue({ playerId: "player-a", playerName: "An", playerToken: "secret-token" })
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={["/join/a7k9q2"]}><Routes><Route path="/join/:roomCode" element={<JoinPage />} /><Route path="/player/:roomCode" element={<p>Player route</p>} /></Routes></MemoryRouter>)
    await user.type(screen.getByLabelText("Tên người chơi"), "An")
    await user.click(screen.getByRole("button", { name: /Vào phòng/i }))
    expect(await screen.findByText("Player route")).toBeInTheDocument()
    expect(JSON.parse(sessionStorage.getItem(playerSessionKey("A7K9Q2"))!)).toEqual({ roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "secret-token" })
    expect(screen.queryByText("secret-token")).toBeNull()
  })

  it("validates the authoritative 1 to 30 character Player name range", async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={["/join/A7K9Q2"]}><Routes><Route path="/join/:roomCode" element={<JoinPage />} /></Routes></MemoryRouter>)
    await user.click(screen.getByRole("button", { name: /Vào phòng/i }))
    expect(screen.getByRole("alert")).toHaveTextContent("từ 1 đến 30 ký tự")
    expect(join.joinRoom).not.toHaveBeenCalled()
  })
})
