import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RoundNotePage from "./RoundNotePage"
import type { HostRoomRouteContext } from "../../host-room/pages/HostRoomPage"
import { archiveGameReview, beginGameReviewSession, loadActiveGameReview } from "../storage/roundNoteStorage"
import LanguageToggle from "../../../components/LanguageToggle"
import { LanguageProvider } from "../../../contexts/LanguageProvider"

const assignments = [{ playerId: "p2", playerName: "Trung", roleId: "villager", roleName: "Villager" }, { playerId: "p1", playerName: "Trung", roleId: "seer", roleName: "Seer" }]
const game = { quantities: {}, selectedRoleCount: 0, lifecycle: "PLAYING" as const, status: "IDLE" as const, statusMessage: "", isRoleSetupValid: false, canConfirmRoleSetup: false, areAllPlayersReady: true, canStart: false, setupConfirmed: true, pending: false, active: true, assignments, gameSessionId: "game-1", winnerOptions: ["VILLAGE"], winningSide: "", updateQuantity: vi.fn(), recommend: vi.fn(), confirmRoleSetup: vi.fn().mockReturnValue(false), setWinningSide: vi.fn(), start: vi.fn().mockResolvedValue(false), end: vi.fn().mockResolvedValue(false), reconcileEnded: vi.fn() }
function renderPage(active = true) { const context: HostRoomRouteContext = { roomCode: "A7K9Q2", players: [], roles: [], game: { ...game, active, lifecycle: active ? "PLAYING" : "WAITING" } }; function Layout() { return <Outlet context={context} /> }; return render(<MemoryRouter initialEntries={["/host/rooms/A7K9Q2/round-note"]}><Routes><Route path="/host/rooms/:roomCode" element={<Layout />}><Route path="round-note" element={<RoundNotePage />} /></Route></Routes></MemoryRouter>) }
function renderPageWithLanguage() { const context: HostRoomRouteContext = { roomCode: "A7K9Q2", players: [], roles: [], game }; function Layout() { return <Outlet context={context} /> }; return render(<LanguageProvider><MemoryRouter initialEntries={["/host/rooms/A7K9Q2/round-note"]}><Routes><Route path="/host/rooms/:roomCode" element={<Layout />}><Route path="round-note" element={<RoundNotePage />} /></Route></Routes><LanguageToggle /></MemoryRouter></LanguageProvider>) }

describe("RoundNotePage", () => {
  beforeEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); beginGameReviewSession("A7K9Q2", "game-1", assignments) })
  it("keeps duplicate-name Player notes separate and confirms history", () => {
    renderPage()
    expect(screen.getByRole("img", { name: "Tiên Tri" })).toHaveAttribute("src", "/roles/seer.webp")
    expect(screen.getByText("Tiên Tri - Trung")).toBeInTheDocument()
    expect(screen.getByText("Dân Làng - Trung")).toBeInTheDocument()
    expect(screen.getByText("Player 1")).toBeInTheDocument()
    expect(screen.getByText("Player 2")).toBeInTheDocument()
    expect(screen.queryByText("Trung - Player 1")).toBeNull()
    expect(screen.queryByText(/Thứ tự gọi ban đêm/i)).toBeNull()
    expect(screen.queryByText(/Theo thứ tự gọi vào ban đêm/i)).toBeNull()
    const rows = screen.getAllByTestId("round-note-entry")
    expect(rows[0]).toHaveTextContent("Tiên Tri - Trung")
    expect(rows[1]).toHaveTextContent("Dân Làng - Trung")
    const notes = screen.getAllByRole("textbox", { name: /- TrungPlayer/ })
    fireEvent.change(notes[0], { target: { value: "seer note" } }); fireEvent.change(notes[1], { target: { value: "villager note" } })
    const stored = loadActiveGameReview("A7K9Q2").session
    expect(stored?.currentRound.playerNotes.find(note => note.playerId === "p1")?.text).toBe("seer note")
    expect(stored?.currentRound.playerNotes.find(note => note.playerId === "p2")?.text).toBe("villager note")
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận vòng 1" }))
    expect(screen.getByText("Vòng đã xác nhận 1")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Vòng 2" })).toBeInTheDocument()
    expect(screen.getAllByRole("textbox").every(input => (input as HTMLTextAreaElement).value === "")).toBe(true)
  })
  it("renders completed review read-only while WAITING", () => {
    archiveGameReview("A7K9Q2", "game-1", "VILLAGE")
    renderPage(false)
    expect(screen.getByRole("heading", { name: "Xem lại ván trước" })).toBeInTheDocument()
    expect(screen.getByText("Phe chiến thắng: VILLAGE")).toBeInTheDocument()
    expect(screen.queryByRole("textbox")).toBeNull()
  })
  it("switches night-role scripts to English", async () => {
    renderPageWithLanguage()

    await userEvent.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))

    expect(screen.getByText(/Seer, wake up and choose one player/i)).toBeInTheDocument()
  })
})
