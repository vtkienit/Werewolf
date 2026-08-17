import { StrictMode, type ReactNode } from "react"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useHostGame } from "./useHostGame"
import { beginRoundNoteSession, loadActiveRoundNoteSession, roundNoteStorageKey, saveRoundNote } from "../../round-note/storage/roundNoteStorage"
const api = vi.hoisted(() => ({ confirmGameSetup: vi.fn(), startGame: vi.fn(), endGame: vi.fn() }))
vi.mock("../../game-distribution", () => api)
const players = Array.from({ length: 6 }, (_, index) => ({ playerId: `p${index}`, playerName: `Player ${index}`, ready: true }))
const roles = [{ roleId: "werewolf", name: "Werewolf", team: "werewolf", maxQuantity: 10 }, { roleId: "villager", name: "Villager", team: "village", maxQuantity: 30 }]
describe("useHostGame lifecycle", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); api.confirmGameSetup.mockReset().mockImplementation((roomCode: string, request: { roles: unknown[] }) => Promise.resolve({ roomCode, activeRoles: request.roles })); api.startGame.mockReset(); api.endGame.mockReset(); vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111") })
  const strictWrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>

  async function actualStartError(response: Response | Error): Promise<Error> {
    const actualApi = await vi.importActual<typeof import("../../game-distribution")>("../../game-distribution")
    vi.stubGlobal("fetch", response instanceof Response ? vi.fn().mockResolvedValue(response) : vi.fn().mockRejectedValue(response))
    try {
      await actualApi.startGame("ABC123", { hostId: "host", roles: [{ roleId: "werewolf", quantity: 1 }] })
    } catch (error) {
      return error as Error
    }
    throw new Error("Expected Start to fail")
  }

  it("completes Start and End under StrictMode without duplicate requests", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    api.endGame.mockResolvedValue({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" })
    const { result } = renderHook(() => useHostGame("ABC123", "host", players, roles), { wrapper: strictWrapper })
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() }); act(() => result.current.setWinningSide("WEREWOLF"))
    expect(api.startGame).toHaveBeenCalledTimes(1); expect(result.current.lifecycle).toBe("PLAYING"); expect(result.current.status).toBe("IDLE"); expect(result.current.pending).toBe(false)
    await act(async () => { await result.current.end() })
    expect(api.endGame).toHaveBeenCalledTimes(1); expect(result.current.lifecycle).toBe("WAITING"); expect(result.current.status).toBe("IDLE"); expect(result.current.pending).toBe(false)
  })
  it("prevents duplicate Start and End and supports WAITING to PLAYING to WAITING to PLAYING", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 }); api.endGame.mockResolvedValue({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" })
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    expect(result.current.lifecycle).toBe("WAITING")
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await Promise.all([result.current.start(), result.current.start()]) }); act(() => result.current.setWinningSide("WEREWOLF"))
    expect(api.startGame).toHaveBeenCalledTimes(1); expect(result.current.lifecycle).toBe("PLAYING")
    await act(async () => { await Promise.all([result.current.end(), result.current.end()]) })
    expect(api.endGame).toHaveBeenCalledTimes(1); expect(result.current.lifecycle).toBe("WAITING")
    vi.mocked(crypto.randomUUID).mockReturnValue("22222222-2222-4222-8222-222222222222")
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(api.startGame).toHaveBeenCalledTimes(2); expect(result.current.lifecycle).toBe("PLAYING")
  })
  it("keeps lifecycle stable across failed Start and End", async () => {
    api.startGame.mockRejectedValue(new Error("Distribution request failed.")); const { result } = renderHook(() => useHostGame("ABC123", "host", players, roles))
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() }); expect(result.current.lifecycle).toBe("WAITING"); expect(result.current.status).toBe("START_ERROR")
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 }); await act(async () => { await result.current.start() }); act(() => result.current.setWinningSide("WEREWOLF"))
    api.endGame.mockRejectedValue(new Error("Distribution request failed.")); await act(async () => { await result.current.end() }); expect(result.current.lifecycle).toBe("PLAYING"); expect(result.current.status).toBe("END_ERROR")
  })
  it("requires six players and reconciles a realtime End", async () => {
    const view = renderHook(({ list }) => useHostGame("ABC123", "host", list, roles), { initialProps: { list: players.slice(0, 5) } })
    expect(view.result.current.canStart).toBe(false); view.rerender({ list: players }); api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    await act(async () => { await view.result.current.confirmRoleSetup() }); await act(async () => { await view.result.current.start() }); act(() => view.result.current.reconcileEnded()); expect(view.result.current.lifecycle).toBe("WAITING")
  })

  it("requires every Player to be explicitly READY", async () => {
    const missingReady = players.map(player => ({ playerId: player.playerId, playerName: player.playerName }))
    const oneUnready = players.map((player, index) => index === 2 ? { ...player, ready: false } : player)

    expect(renderHook(() => useHostGame("ABC123", "host", missingReady, roles)).result.current.canStart).toBe(false)
    expect(renderHook(() => useHostGame("ABC123", "host", oneUnready, roles)).result.current.canStart).toBe(false)
    const ready = renderHook(() => useHostGame("ABC123", "host", players, roles)); await act(async () => { await ready.result.current.confirmRoleSetup() }); expect(ready.result.current.canStart).toBe(true)
  })

  it("confirms six valid roles independently of Player count and Ready state", async () => {
    const sparsePlayers = [{ playerId: "p1", playerName: "Only Player", ready: false }]
    const { result } = renderHook(() => useHostGame("ABC123", "host", sparsePlayers, roles))
    act(() => { result.current.updateQuantity("werewolf", 1); result.current.updateQuantity("villager", 5) })
    expect(result.current.isRoleSetupValid).toBe(true)
    expect(result.current.canConfirmRoleSetup).toBe(true)
    expect(result.current.areAllPlayersReady).toBe(false)
    await act(async () => { await expect(result.current.confirmRoleSetup()).resolves.toBe(true) })
    expect(api.confirmGameSetup).toHaveBeenCalledWith("ABC123", { hostId: "host", roles: [{ roleId: "werewolf", quantity: 1 }, { roleId: "villager", quantity: 5 }] }, expect.any(AbortSignal))
    expect(result.current.setupConfirmed).toBe(true)
    expect(result.current.canStart).toBe(false)
  })

  it("confirms twelve roles while Start still requires exact count and every Player Ready", async () => {
    const mixedReady = players.map((player, index) => ({ ...player, ready: index !== 0 }))
    const view = renderHook(({ list }) => useHostGame("ABC123", "host", list, roles), { initialProps: { list: mixedReady } })
    act(() => { view.result.current.updateQuantity("werewolf", 2); view.result.current.updateQuantity("villager", 10) })
    expect(view.result.current.canConfirmRoleSetup).toBe(true)
    await act(async () => { await expect(view.result.current.confirmRoleSetup()).resolves.toBe(true) })
    expect(view.result.current.canStart).toBe(false)
    view.rerender({ list: Array.from({ length: 12 }, (_, index) => ({ playerId: `p${index}`, playerName: `Player ${index}`, ready: true })) })
    expect(view.result.current.setupConfirmed).toBe(true)
    expect(view.result.current.quantities).toMatchObject({ werewolf: 2, villager: 10 })
    expect(view.result.current.canStart).toBe(true)
  })

  it("rejects confirmation outside the 6 to 12 range and for role-specific quantity violations", async () => {
    const { result } = renderHook(() => useHostGame("ABC123", "host", players, roles))
    act(() => { result.current.updateQuantity("werewolf", 1); result.current.updateQuantity("villager", 4) })
    expect(result.current.canConfirmRoleSetup).toBe(false)
    await act(async () => { await expect(result.current.confirmRoleSetup()).resolves.toBe(false) })
    act(() => { result.current.updateQuantity("werewolf", 11); result.current.updateQuantity("villager", 2) })
    expect(result.current.canConfirmRoleSetup).toBe(false)
    act(() => { result.current.updateQuantity("werewolf", 10); result.current.updateQuantity("villager", 3) })
    expect(result.current.canConfirmRoleSetup).toBe(false)
    expect(api.confirmGameSetup).not.toHaveBeenCalled()
  })

  it("keeps a confirmed setup when Ready state or Player count changes", async () => {
    const view = renderHook(({ list }) => useHostGame("ABC123", "host", list, roles), { initialProps: { list: players } })
    act(() => { view.result.current.updateQuantity("werewolf", 1); view.result.current.updateQuantity("villager", 5) })
    await act(async () => { await view.result.current.confirmRoleSetup() })
    expect(view.result.current.canStart).toBe(true)
    view.rerender({ list: players.map((player, index) => index === 0 ? { ...player, ready: false } : player) })
    expect(view.result.current.setupConfirmed).toBe(true)
    expect(view.result.current.canStart).toBe(false)
    view.rerender({ list: players.slice(0, 5) })
    expect(view.result.current.setupConfirmed).toBe(true)
    expect(view.result.current.quantities).toMatchObject({ werewolf: 1, villager: 5 })
    expect(view.result.current.canStart).toBe(false)
  })

  it("does not silently rewrite a selected setup when the first Player joins", () => {
    const view = renderHook(({ list }) => useHostGame("ABC123", "host", list, roles), { initialProps: { list: [] as typeof players } })
    act(() => view.result.current.updateQuantity("werewolf", 2))
    act(() => view.result.current.updateQuantity("villager", 4))
    expect(view.result.current.selectedRoleCount).toBe(6)
    view.rerender({ list: players.slice(0, 1) })
    expect(view.result.current.quantities).toMatchObject({ werewolf: 2, villager: 4 })
    expect(view.result.current.selectedRoleCount).toBe(6)
  })

  it("archives the selected winner when realtime End arrives before the HTTP response", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    let finishEnd!: (value: { roomCode: string; hostId: string; message: string; status: string }) => void
    api.endGame.mockReturnValue(new Promise(resolve => { finishEnd = resolve }))
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    act(() => result.current.setWinningSide("WEREWOLF"))
    let endResult!: Promise<boolean>
    act(() => { endResult = result.current.end() })

    act(() => result.current.reconcileEnded())
    finishEnd({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" })
    await act(async () => { await endResult })

    const review = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!).sessions[0]
    expect(review).toMatchObject({ completed: true, winningSide: "WEREWOLF" })
  })

  it("keeps authoritative End ahead of a stale Start and starts a later game", async () => {
    let finishStart!: (value: { roomCode: string; numberPlayers: number }) => void
    api.startGame
      .mockResolvedValueOnce({ roomCode: "A7K9Q2", numberPlayers: 6 })
      .mockImplementationOnce(() => new Promise(resolve => { finishStart = resolve }))
      .mockResolvedValueOnce({ roomCode: "A7K9Q2", numberPlayers: 6 })
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(result.current.lifecycle).toBe("PLAYING")
    act(() => result.current.reconcileEnded())
    expect(result.current.lifecycle).toBe("WAITING")
    let startResult!: Promise<boolean>
    await act(async () => { await result.current.confirmRoleSetup() }); act(() => { startResult = result.current.start() })
    expect(result.current.status).toBe("START_REQUEST_PENDING")
    act(() => result.current.reconcileEnded())
    expect(result.current.lifecycle).toBe("WAITING"); expect(result.current.pending).toBe(false)
    await act(async () => { finishStart({ roomCode: "A7K9Q2", numberPlayers: 6 }); await expect(startResult).resolves.toBe(false) })
    expect(result.current.lifecycle).toBe("WAITING")
    const afterStaleStart = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    expect(afterStaleStart.activeSessionId).toBeNull(); expect(afterStaleStart.sessions).toHaveLength(1); expect(afterStaleStart.sessions[0].completed).toBe(true)
    vi.mocked(crypto.randomUUID).mockReturnValue("22222222-2222-4222-8222-222222222222")
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(result.current.lifecycle).toBe("PLAYING")
    const afterRestart = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    expect(afterRestart.sessions).toHaveLength(2); expect(afterRestart.activeSessionId).toBe("22222222-2222-4222-8222-222222222222")
  })

  it("does not let an old End completion end a newer game", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    let finishEnd!: (value: { roomCode: string; hostId: string; message: string; status: string }) => void
    api.endGame.mockReturnValue(new Promise(resolve => { finishEnd = resolve }))
    const { result } = renderHook(() => useHostGame("ABC123", "host", players, roles))
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    let oldEnd!: Promise<boolean>
    act(() => result.current.setWinningSide("WEREWOLF")); act(() => { oldEnd = result.current.end() })
    act(() => result.current.reconcileEnded())
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(result.current.lifecycle).toBe("PLAYING")
    await act(async () => { finishEnd({ roomCode: "ABC123", hostId: "host", message: "end", status: "success" }); await expect(oldEnd).resolves.toBe(false) })
    expect(result.current.lifecycle).toBe("PLAYING")
  })

  it.each([
    ["HTTP 400", () => actualStartError(new Response(JSON.stringify({ message: "bad request" }), { status: 400 }))],
    ["HTTP 409", () => actualStartError(new Response(JSON.stringify({ message: "conflict" }), { status: 409 }))],
    ["network failure", () => actualStartError(new TypeError("Failed to fetch"))],
  ])("preserves custom role quantities after %s", async (_label, createError) => {
    api.startGame.mockRejectedValueOnce(await createError())
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    act(() => { result.current.updateQuantity("werewolf", 1); result.current.updateQuantity("villager", 5) })
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(result.current.lifecycle).toBe("WAITING"); expect(result.current.quantities).toMatchObject({ werewolf: 1, villager: 5 })
    expect(result.current.status).toBe("START_ERROR"); expect(result.current.pending).toBe(false); expect(result.current.statusMessage).not.toBe("")
    expect(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))).toBeNull()
    expect(api.startGame).toHaveBeenCalledTimes(1)
  })

  it("retries with the exact preserved quantities after distinct 400, 409, and network failures", async () => {
    const errors = [
      await actualStartError(new Response(JSON.stringify({ message: "bad request" }), { status: 400 })),
      await actualStartError(new Response(JSON.stringify({ message: "conflict" }), { status: 409 })),
      await actualStartError(new TypeError("Failed to fetch")),
    ]
    api.startGame.mockRejectedValueOnce(errors[0]).mockRejectedValueOnce(errors[1]).mockRejectedValueOnce(errors[2]).mockResolvedValueOnce({ roomCode: "ABC123", numberPlayers: 6 })
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    act(() => { result.current.updateQuantity("werewolf", 1); result.current.updateQuantity("villager", 5) })
    await act(async () => { await result.current.confirmRoleSetup() })
    for (let attempt = 0; attempt < errors.length; attempt++) await act(async () => { await result.current.start() })
    await act(async () => { await result.current.start() })
    expect(result.current.lifecycle).toBe("PLAYING"); expect(api.startGame).toHaveBeenCalledTimes(4)
    expect(api.startGame).toHaveBeenLastCalledWith("A7K9Q2", { hostId: "host", roles: [{ roleId: "werewolf", quantity: 1 }, { roleId: "villager", quantity: 5 }] }, expect.any(AbortSignal))
    const store = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    expect(store.sessions).toHaveLength(1); expect(store.activeSessionId).toBe("11111111-1111-4111-8111-111111111111")
  })

  it("normalizes runtime role quantities to nonnegative integers", () => {
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    act(() => result.current.updateQuantity("werewolf", 1.5)); expect(result.current.quantities.werewolf).toBe(1)
    act(() => result.current.updateQuantity("werewolf", 2.9)); expect(result.current.quantities.werewolf).toBe(2)
    act(() => result.current.updateQuantity("werewolf", -1.5)); expect(result.current.quantities.werewolf).toBe(0)
    act(() => result.current.updateQuantity("werewolf", Number.NaN)); expect(result.current.quantities.werewolf).toBe(0)
    act(() => result.current.updateQuantity("werewolf", Number.POSITIVE_INFINITY)); expect(result.current.quantities.werewolf).toBe(0)
  })

  it("disables Start for a fractional total and sends only integers after correction", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    const { result } = renderHook(() => useHostGame("ABC123", "host", players, roles))
    act(() => { result.current.updateQuantity("werewolf", 1.5); result.current.updateQuantity("villager", 4.5) })
    expect(result.current.quantities).toMatchObject({ werewolf: 1, villager: 4 }); expect(result.current.canStart).toBe(false)
    act(() => result.current.updateQuantity("villager", 5))
    expect(result.current.canStart).toBe(false)
    await act(async () => { await result.current.confirmRoleSetup() }); expect(result.current.canStart).toBe(true)
    await act(async () => { await result.current.start() })
    const rolesSent = api.startGame.mock.calls[0][1].roles
    expect(rolesSent).toEqual([{ roleId: "werewolf", quantity: 1 }, { roleId: "villager", quantity: 5 }])
    expect(rolesSent.every(({ quantity }: { quantity: number }) => Number.isInteger(quantity) && quantity >= 0)).toBe(true)
  })

  it("finalizes duplicate authoritative End exactly once and starts one fresh note session", async () => {
    api.startGame.mockResolvedValue({ roomCode: "ABC123", numberPlayers: 6 })
    const { result } = renderHook(() => useHostGame("A7K9Q2", "host", players, roles))
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    expect(saveRoundNote("A7K9Q2", "11111111-1111-4111-8111-111111111111", 1, "historical note")).toBe(true)
    act(() => result.current.reconcileEnded())
    const afterFirstEnd = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    act(() => result.current.reconcileEnded())
    const afterDuplicateEnd = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    expect(result.current.lifecycle).toBe("WAITING"); expect(result.current.pending).toBe(false)
    expect(afterDuplicateEnd).toEqual(afterFirstEnd); expect(afterDuplicateEnd.activeSessionId).toBeNull(); expect(afterDuplicateEnd.sessions).toHaveLength(1)
    expect(afterDuplicateEnd.sessions[0].completed).toBe(true); expect(afterDuplicateEnd.sessions[0].rounds[0].playerNotes[0].text).toBe("historical note")
    vi.mocked(crypto.randomUUID).mockReturnValue("22222222-2222-4222-8222-222222222222")
    await act(async () => { await result.current.confirmRoleSetup() }); await act(async () => { await result.current.start() })
    const afterRestart = JSON.parse(localStorage.getItem(roundNoteStorageKey("A7K9Q2"))!)
    expect(afterRestart.sessions).toHaveLength(2); expect(afterRestart.activeSessionId).toBe("22222222-2222-4222-8222-222222222222")
  })

  it("preserves quantities and revalidates Start when Player count changes", () => {
    const view = renderHook(({ list }) => useHostGame("ABC123", "host", list, roles), { initialProps: { list: players } })
    act(() => { view.result.current.updateQuantity("werewolf", 1); view.result.current.updateQuantity("villager", 5) })
    view.rerender({ list: players.slice(0, 5) })
    expect(view.result.current.quantities).toMatchObject({ werewolf: 1, villager: 5 })
    expect(view.result.current.canStart).toBe(false)
  })

  it("invalidates late Start completion after real unmount without writing storage", async () => {
    const roomCode = "A7K9Q2"
    const otherRoomCode = "B8M2P4"
    const roomNoteKey = roundNoteStorageKey(roomCode)
    const otherRoomNoteKey = roundNoteStorageKey(otherRoomCode)
    localStorage.setItem("unrelated", "keep")
    expect(beginRoundNoteSession(otherRoomCode)).not.toBeNull()
    const otherRoomBeforeStart = localStorage.getItem(otherRoomNoteKey)
    let finishStart!: (value: { roomCode: string; numberPlayers: number }) => void
    api.startGame.mockReturnValue(new Promise(resolve => { finishStart = resolve }))
    const view = renderHook(() => useHostGame(roomCode, "host", players, roles), { wrapper: strictWrapper })
    expect(localStorage.getItem(roomNoteKey)).toBeNull()
    let startResult!: Promise<boolean>
    await act(async () => { await view.result.current.confirmRoleSetup() }); act(() => { startResult = view.result.current.start() })
    view.unmount()
    finishStart({ roomCode, numberPlayers: 6 })
    await expect(startResult).resolves.toBe(false)
    expect(localStorage.getItem(roomNoteKey)).toBeNull()
    expect(loadActiveRoundNoteSession(roomCode)).toEqual({ session: null, error: null })
    expect(localStorage.getItem(otherRoomNoteKey)).toBe(otherRoomBeforeStart)
    expect(localStorage.getItem("unrelated")).toBe("keep")
  })

  it("invalidates late End completion after real unmount without changing storage", async () => {
    const roomCode = "A7K9Q2"
    const otherRoomCode = "B8M2P4"
    const roomNoteKey = roundNoteStorageKey(roomCode)
    const otherRoomNoteKey = roundNoteStorageKey(otherRoomCode)
    localStorage.setItem("unrelated", "keep")
    expect(beginRoundNoteSession(otherRoomCode)).not.toBeNull()
    const otherRoomBeforeEnd = localStorage.getItem(otherRoomNoteKey)
    api.startGame.mockResolvedValue({ roomCode, numberPlayers: 6 })
    let finishEnd!: (value: { roomCode: string; hostId: string; message: string; status: string }) => void
    api.endGame.mockReturnValue(new Promise(resolve => { finishEnd = resolve }))
    const view = renderHook(() => useHostGame(roomCode, "host", players, roles), { wrapper: strictWrapper })
    await act(async () => { await view.result.current.confirmRoleSetup() }); await act(async () => { await view.result.current.start() })
    expect(saveRoundNote(roomCode, "11111111-1111-4111-8111-111111111111", 1, "note before unmount")).toBe(true)
    const storedBeforeEnd = localStorage.getItem(roomNoteKey)
    expect(storedBeforeEnd).not.toBeNull()
    const parsedBeforeEnd = JSON.parse(storedBeforeEnd!)
    expect(parsedBeforeEnd.activeSessionId).toBe("11111111-1111-4111-8111-111111111111"); expect(parsedBeforeEnd.sessions[0].currentRound.playerNotes[0].text).toBe("note before unmount")
    expect(parsedBeforeEnd.sessions).toHaveLength(1)
    let endResult!: Promise<boolean>
    act(() => view.result.current.setWinningSide("WEREWOLF")); act(() => { endResult = view.result.current.end() })
    view.unmount()
    finishEnd({ roomCode, hostId: "host", message: "end", status: "success" })
    await expect(endResult).resolves.toBe(false)
    expect(localStorage.getItem(roomNoteKey)).toBe(storedBeforeEnd)
    const parsedAfterEnd = JSON.parse(localStorage.getItem(roomNoteKey)!)
    expect(parsedAfterEnd).toEqual(parsedBeforeEnd)
    expect(parsedAfterEnd.activeSessionId).toBe("11111111-1111-4111-8111-111111111111")
    expect(parsedAfterEnd.sessions).toHaveLength(1)
    expect(parsedAfterEnd.sessions[0].completed).toBe(false); expect(parsedAfterEnd.sessions[0].currentRound.playerNotes[0].text).toBe("note before unmount"); expect(parsedAfterEnd.sessions[0].rounds).toEqual([])
    expect(localStorage.getItem(otherRoomNoteKey)).toBe(otherRoomBeforeEnd)
    expect(localStorage.getItem("unrelated")).toBe("keep")
  })
})
