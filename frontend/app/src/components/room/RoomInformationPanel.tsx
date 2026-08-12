import { Check, Copy, Link as LinkIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useClipboardFeedback } from "../../features/host-room/hooks/useClipboardFeedback"
import { useLanguage } from "../../contexts/LanguageProvider"

type RoomInformationPanelProps = {
  roomCode: string
  joinUrl: string
  className?: string
}

export default function RoomInformationPanel({ roomCode, joinUrl, className = "" }: RoomInformationPanelProps) {
  const clipboard = useClipboardFeedback()
  const { translate } = useLanguage()

  return (
    <section aria-label={translate("Thông tin phòng", "Room information")} className={`ww-card ww-room-information ${className}`.trim()}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ww-text-3)]">{translate("Thông tin phòng", "Room information")}</p>
        <p className="mt-3 text-sm font-semibold text-[var(--ww-text-2)]">{translate("Mã phòng", "Room code")}</p>
        <p className="mt-1 break-all font-mono text-3xl font-black tracking-[.12em] text-[var(--ww-gold)] sm:text-4xl">
          {roomCode}
        </p>
      </div>

      <div className="ww-room-information__content">
        <div className="grid min-w-0 gap-3">
          <button type="button" aria-label={translate("Sao chép mã phòng", "Copy room code")} className="ww-button ww-button-secondary w-full" onClick={() => void clipboard.copy(roomCode)}>
            {clipboard.status === "success" ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
            {translate("Sao chép mã phòng", "Copy room code")}
          </button>
          <button type="button" aria-label={translate("Sao chép liên kết tham gia", "Copy join link")} className="ww-button ww-button-secondary w-full" onClick={() => void clipboard.copy(joinUrl)}>
            <LinkIcon aria-hidden="true" size={18} />
            {translate("Sao chép liên kết tham gia", "Copy join link")}
          </button>
          <div aria-live="polite" className="min-h-5 text-xs text-[var(--ww-gold)]">
            {clipboard.message && <p role="status">{clipboard.message}</p>}
          </div>
        </div>

        <div className="ww-room-information__qr">
          <QRCodeSVG
            value={joinUrl}
            level="M"
            marginSize={2}
            size={160}
            className="h-full w-full"
            role="img"
            aria-label={translate("Mã QR để tham gia phòng", "QR code for joining room")}
          />
        </div>
      </div>
    </section>
  )
}
