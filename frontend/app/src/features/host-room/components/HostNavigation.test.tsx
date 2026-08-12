import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it } from "vitest"
import HostNavigation from "./HostNavigation"

describe("HostNavigation", () => {
  afterEach(cleanup)
  it("links Setup and exposes Round Note only for an active game", () => {
    const view = render(<MemoryRouter><HostNavigation roomCode="A7K9Q2" gameActive={false} /></MemoryRouter>)
    expect(screen.getByRole("link", { name: "Thiết lập vai trò" })).toHaveAttribute("href", "/host/rooms/A7K9Q2/setup")
    expect(screen.getByText("Round Note")).toHaveAttribute("aria-disabled", "true")
    view.unmount()
    render(<MemoryRouter><HostNavigation roomCode="A7K9Q2" gameActive /></MemoryRouter>)
    expect(screen.getByRole("link", { name: "Round Note" })).toHaveAttribute("href", "/host/rooms/A7K9Q2/round-note")
    expect(document.body.innerHTML).not.toContain("hostId")
  })
})
