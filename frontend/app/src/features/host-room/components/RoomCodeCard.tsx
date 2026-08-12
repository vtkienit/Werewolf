import { Copy, Link as LinkIcon } from "lucide-react"
import { useClipboardFeedback } from "../hooks/useClipboardFeedback"
import RoomQrCode from "./RoomQrCode"

type RoomCodeCardProps = {
  roomCode: string
  joinUrl: string
}

const buttonClass = "ww-button ww-button-secondary"

export default function RoomCodeCard({ roomCode, joinUrl }: RoomCodeCardProps) {
  const clipboard = useClipboardFeedback()

  return (
    <section aria-labelledby="room-sharing-title" className="ww-card ww-card-gold p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]">Invite the village</p>
        <h2 id="room-sharing-title" className="ww-display mt-1 text-xl text-[var(--ww-text)]">Room sharing</h2>
      </div>
      <div className="mb-5 rounded-2xl border border-[var(--ww-border)] bg-[var(--ww-surface-2)] p-4 text-center">
        <p className="text-sm text-[var(--ww-text-2)]">Room code</p>
        <p className="select-all font-mono text-3xl font-black tracking-[.18em] text-[var(--ww-gold)] sm:text-4xl">{roomCode}</p>
      </div>
      <RoomQrCode joinUrl={joinUrl} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={() => void clipboard.copy(roomCode)}>
          <Copy aria-hidden="true" size={18} /> Sao chép mã phòng
        </button>
        <button type="button" className={buttonClass} onClick={() => void clipboard.copy(joinUrl)}>
          <LinkIcon aria-hidden="true" size={18} /> Sao chép liên kết tham gia
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-[var(--ww-gold)]">
        {clipboard.message}
      </p>
    </section>
  )
}
