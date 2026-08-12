import { Crown } from "lucide-react"
import { BrandMark } from "../../../components/game-ui/GameShell"
import { StatusBadge } from "../../../components/game-ui/GamePrimitives"
import type { HostRoomStatus } from "../types/hostRoomShell"

const STATUS_LABELS: Record<HostRoomStatus, string> = {
  loading: "Preparing room",
  error: "Host access needs attention",
  waiting: "Waiting for the village",
  "in-game": "Game in progress",
}

type HostRoomHeaderProps = {
  roomCode: string
  status: HostRoomStatus
  isMockStatus: boolean
}

export default function HostRoomHeader({ roomCode, status, isMockStatus }: HostRoomHeaderProps) {
  return (
    <header className="ww-card ww-card-crimson p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BrandMark size="sm" />
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]"><Crown aria-hidden="true" size={15} /> Village Host</p>
            <h1 className="ww-display mt-1 text-3xl text-[var(--ww-text)] sm:text-4xl">Host Room</h1>
            <p className="mt-1 text-sm text-[var(--ww-text-2)]">Share the invitation, watch the lobby, and prepare the game.</p>
          </div>
        </div>
        <div className="ww-inset-surface rounded-2xl border border-[var(--ww-border)] px-5 py-4 sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ww-text-3)]">Room code</p>
          <p className="select-all font-mono text-2xl font-black tracking-[.14em] text-[var(--ww-gold)]">{roomCode}</p>
          <div className="mt-2"><StatusBadge tone={status === "in-game" ? "crimson" : status === "error" ? "crimson" : "muted"}>{STATUS_LABELS[status]}</StatusBadge></div>
          {isMockStatus && <p className="mt-2 text-xs text-[var(--ww-text-3)]">Temporary presentation until live room integration</p>}
        </div>
      </div>
    </header>
  )
}
