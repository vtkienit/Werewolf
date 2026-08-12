import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import RoomCodeCard from "./RoomCodeCard"

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => <svg data-testid="room-qr" data-value={value} />,
}))

describe("RoomCodeCard", () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("shows exact selectable sharing values and copies each exact value", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("navigator", { clipboard: { writeText } })
    const joinUrl = "https://werewolf.example/join/A7K9Q2"
    render(<RoomCodeCard roomCode="A7K9Q2" joinUrl={joinUrl} />)

    expect(screen.getByText("A7K9Q2")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: joinUrl })).toHaveAttribute("href", joinUrl)
    expect(screen.getByTestId("room-qr")).toHaveAttribute("data-value", joinUrl)

    await user.click(screen.getByRole("button", { name: "Sao chép mã phòng" }))
    expect(writeText).toHaveBeenLastCalledWith("A7K9Q2")
    expect(screen.getByRole("status")).toHaveTextContent("Đã sao chép")
    await user.click(screen.getByRole("button", { name: "Sao chép liên kết tham gia" }))
    expect(writeText).toHaveBeenLastCalledWith(joinUrl)
  })

  it("shows deterministic feedback for rejection and unsupported clipboard", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } })
    const { unmount } = render(<RoomCodeCard roomCode="A7K9Q2" joinUrl="https://werewolf.example/join/A7K9Q2" />)
    await user.click(screen.getByRole("button", { name: "Sao chép mã phòng" }))
    expect(screen.getByRole("status")).toHaveTextContent("Không thể sao chép")
    unmount()

    vi.stubGlobal("navigator", {})
    render(<RoomCodeCard roomCode="A7K9Q2" joinUrl="https://werewolf.example/join/A7K9Q2" />)
    await user.click(screen.getByRole("button", { name: "Sao chép liên kết tham gia" }))
    expect(screen.getByRole("status")).toHaveTextContent("Không thể sao chép")
  })

  it("restarts success feedback after a repeated copy", async () => {
    vi.useFakeTimers()
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<RoomCodeCard roomCode="A7K9Q2" joinUrl="https://werewolf.example/join/A7K9Q2" />)
    const button = screen.getByRole("button", { name: "Sao chép mã phòng" })
    await act(async () => button.click())
    act(() => vi.advanceTimersByTime(1500))
    await act(async () => button.click())
    act(() => vi.advanceTimersByTime(600))
    expect(screen.getByRole("status")).toHaveTextContent("Đã sao chép")
  })
})
