import { beforeEach, describe, expect, it, vi } from "vitest"
const clients: FakeClient[] = []
class FakeClient { onConnect?: () => void; activate = vi.fn(); deactivate = vi.fn().mockResolvedValue(undefined); publish = vi.fn(); subscribe = vi.fn(() => ({ unsubscribe: vi.fn() })); constructor() { clients.push(this) } }
vi.mock("@stomp/stompjs", () => ({ Client: FakeClient })); vi.mock("sockjs-client", () => ({ default: vi.fn() }))
describe("hostRoomSocket", () => {
  beforeEach(() => clients.splice(0))
  it("maintains one public snapshot and one End subscription across reconnects", async () => {
    const { createHostRoomClient, deactivateHostRoomClient } = await import("./hostRoomSocket"); const onSnapshot = vi.fn(); const onEndGame = vi.fn(); const client = createHostRoomClient("ABC123", "host-secret", onSnapshot, onEndGame)
    client.onConnect?.({} as never); expect(client.subscribe).toHaveBeenCalledTimes(2); expect(client.subscribe).toHaveBeenCalledWith("/broadcast/rooms/ABC123/players", expect.any(Function)); expect(client.subscribe).toHaveBeenCalledWith("/broadcast/rooms/ABC123/end-game", expect.any(Function))
    expect(client.publish).toHaveBeenCalledWith({ destination: "/app/rooms/ABC123/connect", body: JSON.stringify({ hostId: "host-secret" }) })
    expect((client.subscribe as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0]).toBeLessThan((client.publish as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0])
    const calls = (client.subscribe as ReturnType<typeof vi.fn>).mock.calls; const snapshot = calls[0][1]; const end = calls[1][1]
    snapshot({ body: JSON.stringify({ roomCode: "ABC123", status: "WAITING", currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "p1", playerName: "Player", isConnected: true, ready: false }] }) }); expect(onSnapshot).toHaveBeenCalledTimes(1)
    snapshot({ body: JSON.stringify({ roomCode: "ABC123", status: "WAITING", currentPlayers: 1, maxPlayers: 6, players: [{ playerId: "p1", playerName: "Player", isConnected: true, roleId: "werewolf" }] }) }); expect(onSnapshot).toHaveBeenCalledTimes(1)
    end({ body: JSON.stringify({ gameId: "game-1" }) }); expect(onEndGame).toHaveBeenCalledTimes(1)
    const firstSubscriptions = (client.subscribe as ReturnType<typeof vi.fn>).mock.results.slice(0, 2).map(result => result.value)
    client.onConnect?.({} as never)
    expect(client.subscribe).toHaveBeenCalledTimes(4)
    firstSubscriptions.forEach(subscription => expect(subscription.unsubscribe).toHaveBeenCalledTimes(1))
    const currentSubscriptions = (client.subscribe as ReturnType<typeof vi.fn>).mock.results.slice(2, 4).map(result => result.value)
    await deactivateHostRoomClient(client); await deactivateHostRoomClient(client)
    currentSubscriptions.forEach(subscription => expect(subscription.unsubscribe).toHaveBeenCalledTimes(1))
    expect(client.deactivate).toHaveBeenCalledTimes(1)
  })
})
