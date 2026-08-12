import { canonicalRoomCode } from "../../../config/playerSessionStorage"
import type { RoomLifecycle } from "../../game-setup/hooks/useHostGame"
export function hostLifecycleStorageKey(roomCode: string): string { const code = canonicalRoomCode(roomCode); return `masoi.host.rooms.${code ?? "INVALID"}.lifecycle` }
export function loadHostLifecycle(roomCode: string): RoomLifecycle { const code = canonicalRoomCode(roomCode); if (!code) return "WAITING"; try { sessionStorage.removeItem(hostLifecycleStorageKey(code)) } catch { } return "WAITING" }
