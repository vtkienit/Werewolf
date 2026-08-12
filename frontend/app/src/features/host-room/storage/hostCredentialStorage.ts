export function storeHostCredential(roomCode: string, hostId: string): void {
  sessionStorage.setItem(`masoi.host.rooms.${roomCode}.hostId`, hostId)
}

export function getHostCredential(roomCode: string): string | null {
  return sessionStorage.getItem(`masoi.host.rooms.${roomCode}.hostId`)
}
