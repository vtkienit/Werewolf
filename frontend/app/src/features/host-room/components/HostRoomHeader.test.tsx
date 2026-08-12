import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import HostRoomHeader from "./HostRoomHeader"

describe("HostRoomHeader", () => {
  afterEach(cleanup)

  it("identifies the Host room, exact code, readable status, and temporary source", () => {
    render(<HostRoomHeader roomCode="A7K9Q2" status="waiting" isMockStatus />)
    expect(screen.getByRole("heading", { level: 1, name: "Host Room" })).toBeInTheDocument()
    expect(screen.getByText("A7K9Q2")).toBeInTheDocument()
    expect(screen.getByText("Waiting for the village")).toBeInTheDocument()
    expect(screen.getByText(/temporary presentation/i)).toBeInTheDocument()
    expect(document.body.textContent).not.toContain("hostId")
  })
})
