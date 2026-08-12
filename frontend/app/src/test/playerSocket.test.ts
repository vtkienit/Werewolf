import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({ clients: [] as Array<any>, sockets: [] as Array<any> }))
vi.mock("sockjs-client", () => ({ default: class { constructor(url: string) { state.sockets.push({ url }) } } }))
vi.mock("@stomp/stompjs", () => ({
  Client: class {
    onConnect: () => void = () => {}; options: any
    constructor(options: any) { this.options = options; state.clients.push(this) }
    activate = vi.fn(); deactivate = vi.fn().mockResolvedValue(undefined)
    subscribe = vi.fn((_destination: string, _callback: (message: { body: string }) => void, _headers?: Record<string, string>) => ({ unsubscribe: vi.fn() }))
    publish = vi.fn()
  },
}))

import { createLobbyClient, deactivateLobbyClient, parseSnapshot } from "../config/playerSocket"

const session = { roomCode: "A7K9Q2", playerId: "player-a", playerName: "An", playerToken: "secret-token" }
const snapshot = { roomCode: "A7K9Q2", status: "WAITING" as const, currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "player-a", playerName: "An", isConnected: true, ready: false }] }
const callbacks = () => ({ onSnapshot: vi.fn(), onStartGame: vi.fn(), onEndGame: vi.fn(), onAuthFailure: vi.fn(), onTemporaryFailure: vi.fn() })

describe("player socket", () => {
  beforeEach(() => { state.clients.length = 0; state.sockets.length = 0 })

  it("creates one client and subscribes all destinations before publishing credentials", () => {
    const cb = callbacks(); const client = createLobbyClient(session.roomCode, session, cb) as any
    expect(state.clients).toHaveLength(1); client.onConnect()
    expect(client.subscribe.mock.calls).toEqual([
      ["/broadcast/rooms/A7K9Q2/players", expect.any(Function)],
      ["/broadcast/distribution/rooms/A7K9Q2/start-game/player-a", expect.any(Function), { "X-Player-Token": "secret-token" }],
      ["/broadcast/rooms/A7K9Q2/end-game", expect.any(Function)],
    ])
    expect(client.publish).toHaveBeenCalledWith({ destination: "/app/rooms/A7K9Q2/connect", body: JSON.stringify({ playerId: "player-a", playerToken: "secret-token" }) })
    expect(Math.max(...client.subscribe.mock.invocationCallOrder)).toBeLessThan(client.publish.mock.invocationCallOrder[0])
    client.options.webSocketFactory(); expect(state.sockets).toEqual([{ url: expect.any(String) }])
  })

  it("delivers only strict valid snapshot, start, and end events", () => {
    const cb = callbacks(); const client = createLobbyClient(session.roomCode, session, cb) as any; client.onConnect()
    const [, startReceive] = client.subscribe.mock.calls[1]; const [, endReceive] = client.subscribe.mock.calls[2]; const [, snapshotReceive] = client.subscribe.mock.calls[0]
    snapshotReceive({ body: JSON.stringify(snapshot) }); startReceive({ body: '{"gameId":"game-001","playerName":"Kien","roleId":"werewolf"}' }); endReceive({ body: '{"gameId":"game-001"}' })
    expect(cb.onSnapshot).toHaveBeenCalledExactlyOnceWith({ ...snapshot, activeRoles: [], lastCompletedGame: null })
    expect(cb.onStartGame).toHaveBeenCalledExactlyOnceWith({ gameId: "game-001", playerName: "Kien", roleId: "werewolf" })
    expect(cb.onEndGame).toHaveBeenCalledExactlyOnceWith({ gameId: "game-001" })
    startReceive({ body: '{"gameId":"g","playerName":"K","roleId":"unknown"}' }); endReceive({ body: '{"gameId":"secret","extra":true}' }); startReceive({ body: "{" })
    expect(cb.onStartGame).toHaveBeenCalledTimes(1); expect(cb.onEndGame).toHaveBeenCalledTimes(1)
  })

  it("replaces all subscriptions on reconnect without creating another client", () => {
    const client = createLobbyClient(session.roomCode, session, callbacks()) as any; client.onConnect()
    const first = client.subscribe.mock.results.map((result: any) => result.value); client.onConnect()
    first.forEach((subscription: any) => expect(subscription.unsubscribe).toHaveBeenCalledOnce())
    expect(client.subscribe).toHaveBeenCalledTimes(6); expect(client.publish).toHaveBeenCalledTimes(2); expect(state.clients).toHaveLength(1)
  })

  it("deactivates idempotently, unsubscribes all, and ignores later reconnect callbacks", async () => {
    const client = createLobbyClient(session.roomCode, session, callbacks()) as any; client.onConnect()
    const active = client.subscribe.mock.results.map((result: any) => result.value)
    await deactivateLobbyClient(client); await deactivateLobbyClient(client)
    active.forEach((subscription: any) => expect(subscription.unsubscribe).toHaveBeenCalledOnce())
    expect(client.deactivate).toHaveBeenCalledOnce(); client.onConnect(); expect(client.subscribe).toHaveBeenCalledTimes(3)
  })

  it("contains callback exceptions and preserves exact terminal authentication handling", async () => {
    const cb = callbacks(); cb.onStartGame.mockImplementation(() => { throw new Error("callback") })
    const client = createLobbyClient(session.roomCode, session, cb) as any; client.onConnect()
    expect(() => client.subscribe.mock.calls[1][1]({ body: '{"gameId":"g","playerName":"K","roleId":"werewolf"}' })).not.toThrow()
    client.options.onStompError({ body: '{"code":"SOCKET_AUTH_FAILED"}', headers: {} }); client.options.onStompError({ body: "", headers: { message: "SOCKET_AUTH_FAILED" } })
    client.options.onStompError({ body: '{"code":"OTHER"}', headers: {} }); expect(cb.onAuthFailure).toHaveBeenCalledTimes(2)
    await deactivateLobbyClient(client)
  })

  it("keeps exact snapshot validation behavior", () => {
    expect(parseSnapshot(snapshot, "A7K9Q2")).toEqual({ ...snapshot, activeRoles: [], lastCompletedGame: null })
    expect(parseSnapshot({ ...snapshot, activeRoles: [{ roleId: "seer", quantity: 1 }, { roleId: "seer", quantity: 2 }, { roleId: "unknown", quantity: 9 }, { playerId: "p1", roleId: "werewolf", quantity: 1 }], lastCompletedGame: { winningSide: "VILLAGE", roles: [{ roleId: "werewolf", quantity: 2 }] } }, "A7K9Q2"))
      .toMatchObject({ activeRoles: [{ roleId: "seer", quantity: 3 }], lastCompletedGame: { winningSide: "VILLAGE", roles: [{ roleId: "werewolf", quantity: 2 }] } })
    expect(parseSnapshot({ ...snapshot, roleId: "werewolf" }, "A7K9Q2")).toBeNull()
    expect(parseSnapshot({ ...snapshot, status: "FULL" }, "A7K9Q2")).toBeNull()
  })
})
