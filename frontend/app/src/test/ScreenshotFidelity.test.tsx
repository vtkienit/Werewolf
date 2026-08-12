import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import HomeView from "../features/host-room/views/HomeView"
import CreateRoomView from "../features/host-room/views/CreateRoomView"
import JoinRoomView from "../views/JoinRoomView"

afterEach(cleanup)

describe("screenshot composition", () => {
  it("does not render design-canvas URL annotations on public entry pages", () => {
    const home = render(
      <MemoryRouter>
        <HomeView roomCode="" error={null} onRoomCodeChange={vi.fn()} onJoin={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.queryByText(window.location.origin)).toBeNull()
    home.unmount()

    const create = render(
      <MemoryRouter>
        <CreateRoomView
          maxPlayers={6}
          pending={false}
          error={null}
          createdRoomCode={null}
          onMaxPlayersChange={vi.fn()}
          onSubmit={vi.fn()}
          onContinueWithDefault={vi.fn()}
          onBack={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByText(`${window.location.origin}/host/create`)).toBeNull()
    create.unmount()

    render(
      <MemoryRouter>
        <JoinRoomView
          roomCode="A7K9Q2"
          playerName=""
          pending={false}
          error={null}
          onPlayerNameChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByText(`${window.location.origin}/join/A7K9Q2`)).toBeNull()
  })
})
