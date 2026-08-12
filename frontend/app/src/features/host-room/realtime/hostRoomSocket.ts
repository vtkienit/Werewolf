import { Client } from "@stomp/stompjs"
import type { StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { environment } from "../../../config/environment"
import { endGameDestination, parseSnapshot, snapshotDestination } from "../../../config/playerSocket"
import type { PlayerListSnapshot } from "../../../config/playerLobbyTypes"

const subscriptions = new WeakMap<Client, StompSubscription[]>()
const deactivated = new WeakSet<Client>()
export function createHostRoomClient(roomCode: string, hostId: string, onSnapshot: (snapshot: PlayerListSnapshot) => void, onEndGame: () => void): Client {
  const client = new Client({ webSocketFactory: () => new SockJS(environment.webSocketUrl), reconnectDelay: 2000 })
  client.onConnect = () => {
    if (deactivated.has(client)) return
    subscriptions.get(client)?.forEach(subscription => subscription.unsubscribe())
    subscriptions.set(client, [
      client.subscribe(snapshotDestination(roomCode), message => { try { const snapshot = parseSnapshot(JSON.parse(message.body) as unknown, roomCode); if (snapshot) onSnapshot(snapshot) } catch { } }),
      client.subscribe(endGameDestination(roomCode), () => onEndGame()),
    ])
    client.publish({ destination: "/app/rooms/" + roomCode + "/connect", body: JSON.stringify({ hostId }) })
  }
  return client
}
export async function deactivateHostRoomClient(client: Client): Promise<void> {
  if (deactivated.has(client)) return
  deactivated.add(client); subscriptions.get(client)?.forEach(subscription => subscription.unsubscribe()); subscriptions.delete(client); await client.deactivate()
}
