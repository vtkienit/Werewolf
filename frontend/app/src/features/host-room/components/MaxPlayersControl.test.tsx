import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import MaxPlayersControl from "./MaxPlayersControl"

describe("MaxPlayersControl", () => {
  afterEach(cleanup)

  it("offers values 6 through 12 and disables values below the player count", () => {
    render(
      <MaxPlayersControl
        confirmedMaxPlayers={8}
        playerCount={8}
        draft={8}
        onDraftChange={() => {}}
        loading={false}
        error={null}
        canSubmit={false}
        onSubmit={() => {}}
      />,
    )
    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(7)
    expect(screen.getByRole("option", { name: "6" })).toBeDisabled()
    expect(screen.getByRole("option", { name: "7" })).toBeDisabled()
    expect(screen.getByRole("option", { name: "8" })).toBeEnabled()
    expect(screen.getByRole("option", { name: "12" })).toBeEnabled()
  })

  it("disables selection and submission while loading", () => {
    render(
      <MaxPlayersControl
        confirmedMaxPlayers={6}
        playerCount={0}
        draft={9}
        onDraftChange={() => {}}
        loading={true}
        error={null}
        canSubmit={true}
        onSubmit={() => {}}
      />,
    )
    expect(screen.getByRole("combobox")).toBeDisabled()
    expect(screen.getByRole("button")).toBeDisabled()
    expect(screen.getByRole("button")).toHaveTextContent("Đang cập nhật...")
  })

  it("renders the error with an alert role and offers retry", async () => {
    const onSubmit = vi.fn()
    render(
      <MaxPlayersControl
        confirmedMaxPlayers={6}
        playerCount={0}
        draft={9}
        onDraftChange={() => {}}
        loading={false}
        error={{ code: "NETWORK_ERROR", message: "Unable to connect to the server" }}
        canSubmit={true}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to connect to the server")
    expect(screen.getByRole("button")).toHaveTextContent("Thử lại")
    await userEvent.click(screen.getByRole("button"))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("emits an update intent on successful submission", async () => {
    const onSubmit = vi.fn()
    render(
      <MaxPlayersControl
        confirmedMaxPlayers={6}
        playerCount={0}
        draft={9}
        onDraftChange={() => {}}
        loading={false}
        error={null}
        canSubmit={true}
        onSubmit={onSubmit}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Cập nhật" }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it("disables editing while PLAYING", () => {
    render(<MaxPlayersControl confirmedMaxPlayers={8} playerCount={6} draft={8} onDraftChange={() => {}} loading={false} error={null} canSubmit onSubmit={() => {}} disabled />)
    expect(screen.getByRole("combobox")).toBeDisabled()
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("emits draft changes without owning players or QR", () => {
    const onDraftChange = vi.fn()
    render(
      <MaxPlayersControl
        confirmedMaxPlayers={6}
        playerCount={0}
        draft={6}
        onDraftChange={onDraftChange}
        loading={false}
        error={null}
        canSubmit={false}
        onSubmit={() => {}}
      />,
    )
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "9" } })
    expect(onDraftChange).toHaveBeenCalledWith(9)
    expect(screen.queryByText(/qr/i)).not.toBeInTheDocument()
  })
})
