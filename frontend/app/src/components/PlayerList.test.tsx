import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { PlayerList } from "../components/PlayerList"
afterEach(cleanup)
describe("PlayerList", () => {
  it("renders an empty safe waiting state", () => { render(<PlayerList maxPlayers={6} players={[]} />); expect(screen.getByRole("status")).toHaveTextContent("Đang chờ người chơi") })
  it("renders connection state and never role or token data", () => { render(<PlayerList maxPlayers={6} currentPlayerId="a" players={[{ playerId: "a", playerName: "An", isConnected: true }, { playerId: "b", playerName: "Binh", isConnected: false }]} />); expect(screen.getByText(/An/)).toHaveTextContent("Đã kết nối"); expect(screen.getByText(/Binh/)).toHaveTextContent("Ngoại tuyến"); expect(screen.queryByText(/token|role/i)).toBeNull() })
  it("preserves player order and shows waiting and full counts with text states", () => {
    const { rerender } = render(<PlayerList maxPlayers={3} players={[{ playerId: "a", playerName: "An", isConnected: true }, { playerId: "b", playerName: "Binh", isConnected: false }]} />)
    expect(screen.getByLabelText("Người chơi").textContent).toMatch(/Đang chờ người chơi \(2\/3\).*An.*Binh/s)
    rerender(<PlayerList maxPlayers={2} players={[{ playerId: "a", playerName: "An", isConnected: true }, { playerId: "b", playerName: "Binh", isConnected: true }]} />)
    expect(screen.getByText("Phòng đã đầy")).toBeInTheDocument()
  })
})

