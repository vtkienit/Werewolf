import { environment } from "./environment"

export async function updatePlayerReady(roomCode: string, playerId: string, playerToken: string, ready: boolean): Promise<void> {
  const response = await fetch(`${environment.apiUrl}/api/rooms/${roomCode}/players/${encodeURIComponent(playerId)}/ready`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Player-Token": playerToken },
    body: JSON.stringify({ ready }),
  })
  if (!response.ok) throw new Error("Ready state could not be updated.")
}
