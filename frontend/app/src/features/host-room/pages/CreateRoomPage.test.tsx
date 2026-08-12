import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import CreateRoomPage from "./CreateRoomPage"

const mocks = vi.hoisted(() => ({ request: vi.fn(), update: vi.fn(), navigate: vi.fn() }))
vi.mock("../api/createRoomApi", () => ({ createRoom: mocks.request }))
vi.mock("../api/updateMaxPlayersApi", () => ({ updateMaxPlayers: mocks.update }))
vi.mock("react-router-dom", async (importOriginal) => ({ ...(await importOriginal<typeof import("react-router-dom")>()), useNavigate: () => mocks.navigate }))

describe("CreateRoomPage", () => {
  afterEach(cleanup)
  beforeEach(() => {
    mocks.request.mockReset()
    mocks.update.mockReset()
    mocks.navigate.mockReset()
    sessionStorage.clear()
  })

  it("renders the real creation form with the authoritative default capacity", () => {
    render(<CreateRoomPage />)
    expect(screen.getByRole("button", { name: /Tạo phòng/i })).toBeEnabled()
    expect(screen.getByLabelText("Số người chơi tối đa")).toHaveValue("6")
    expect(screen.getAllByRole("option")).toHaveLength(7)
  })

  it("guards immediate duplicate submissions and stores before exact navigation", async () => {
    let resolve!: (value: { roomCode: string; hostId: string; qrUrl: string }) => void
    mocks.request.mockReturnValue(new Promise((done) => { resolve = done }))
    const storage = vi.spyOn(Storage.prototype, "setItem")
    render(<CreateRoomPage />)
    const button = screen.getByRole("button", { name: /Tạo phòng/i })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mocks.request).toHaveBeenCalledTimes(1)
    expect(button).toBeDisabled()
    resolve({ roomCode: "A7K9Q2", hostId: "exact-host-id", qrUrl: "http://localhost/join/A7K9Q2" })
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/host/rooms/A7K9Q2"))
    expect(sessionStorage.getItem("masoi.host.rooms.A7K9Q2.hostId")).toBe("exact-host-id")
    expect(storage.mock.invocationCallOrder[0]).toBeLessThan(mocks.navigate.mock.invocationCallOrder[0])
    expect(mocks.update).not.toHaveBeenCalled()
    storage.mockRestore()
  })

  it("applies a selected capacity through the existing PATCH API before navigation", async () => {
    mocks.request.mockResolvedValue({ roomCode: "A7K9Q2", hostId: "host-id", qrUrl: "http://localhost/join/A7K9Q2" })
    mocks.update.mockResolvedValue({ maxPlayers: 9 })
    const user = userEvent.setup()
    render(<CreateRoomPage />)
    await user.selectOptions(screen.getByLabelText("Số người chơi tối đa"), "9")
    await user.click(screen.getByRole("button", { name: /Tạo phòng/i }))
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith("A7K9Q2", "host-id", 9))
    expect(mocks.navigate).toHaveBeenCalledWith("/host/rooms/A7K9Q2")
  })

  it("shows an error, stores nothing, and permits a successful retry", async () => {
    mocks.request.mockRejectedValueOnce(new Error("Unable to connect to the server"))
      .mockResolvedValueOnce({ roomCode: "B8M2P4", hostId: "retry-host", qrUrl: "http://localhost/join/B8M2P4" })
    render(<CreateRoomPage />)
    await userEvent.click(screen.getByRole("button", { name: /Tạo phòng/i }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to connect to the server")
    expect(sessionStorage.length).toBe(0)
    expect(mocks.navigate).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: /Tạo phòng/i }))
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/host/rooms/B8M2P4"))
    expect(sessionStorage.getItem("masoi.host.rooms.B8M2P4.hostId")).toBe("retry-host")
  })
})
