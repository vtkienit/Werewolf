import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import RoomQrCode from "./RoomQrCode"

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value, ...props }: { value: string; [key: string]: unknown }) => {
    if (value.includes("throw.example")) throw new Error("renderer detail")
    return <svg data-testid="qr-svg" data-value={value} data-level={String(props.level)} aria-label={String(props["aria-label"])} />
  },
}))

describe("RoomQrCode", () => {
  afterEach(cleanup)

  it("passes the exact join URL to the SVG renderer and keeps an accessible link", () => {
    const joinUrl = "https://werewolf.example/join/A7K9Q2"
    render(<RoomQrCode joinUrl={joinUrl} />)
    expect(screen.getByTestId("qr-svg")).toHaveAttribute("data-value", joinUrl)
    expect(screen.getByTestId("qr-svg")).toHaveAttribute("data-level", "M")
    expect(screen.getByLabelText("QR code for joining room")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: joinUrl })).toHaveAttribute("href", joinUrl)
  })

  it("contains a renderer failure locally and leaves the join link usable", () => {
    const joinUrl = "https://throw.example/join/A7K9Q2"
    render(<RoomQrCode joinUrl={joinUrl} />)
    expect(screen.getByText("QR code could not be displayed.")).toBeInTheDocument()
    expect(screen.queryByText(/renderer detail/i)).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: joinUrl })).toHaveAttribute("href", joinUrl)
  })
})
