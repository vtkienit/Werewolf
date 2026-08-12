export function createJoinUrl(roomCode: string, origin = window.location.origin): string {
  return new URL(`/join/${encodeURIComponent(roomCode)}`, origin).toString()
}
