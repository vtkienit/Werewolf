import { ArrowLeft, LockKeyhole, PlusCircle, Users } from "lucide-react"
import { GameCard, GameButton } from "../../../components/game-ui/GamePrimitives"
import { BrandMark, GameShell } from "../../../components/game-ui/GameShell"
import { useLanguage } from "../../../contexts/LanguageProvider"

type CreateRoomViewProps = {
  maxPlayers: number
  pending: boolean
  error: string | null
  createdRoomCode: string | null
  onMaxPlayersChange: (value: number) => void
  onSubmit: () => void
  onContinueWithDefault: () => void
  onBack: () => void
}

const capacities = Array.from({ length: 7 }, (_, index) => index + 6)

export default function CreateRoomView({ maxPlayers, pending, error, createdRoomCode, onMaxPlayersChange, onSubmit, onContinueWithDefault, onBack }: CreateRoomViewProps) {
  const { translate } = useLanguage()
  return (
    <GameShell narrow center>
      <button type="button" className="ww-button ww-button-ghost mb-6 self-start" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={18} /> {translate("Quay lại trang chủ", "Back to home")}
      </button>
      <GameCard className="ww-reveal p-6 text-center sm:p-8" glow="gold">
        <div className="flex justify-center"><BrandMark /></div>
        <h1 className="ww-display mt-5 text-3xl text-[var(--ww-text)]">{translate("Tạo phòng mới", "Create a new room")}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--ww-text-2)]">{translate("Bạn sẽ nhận mã phòng và quyền truy cập Host riêng tư. Vai của người chơi được gửi riêng và không bao giờ hiển thị tại đây.", "You receive the room code and private Host access. Player roles are delivered privately and never shown here.")}</p>
        <form className="mt-7 text-left" onSubmit={event => { event.preventDefault(); onSubmit() }} aria-label={translate("Tạo phòng", "Create room")} noValidate>
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--ww-text)]" htmlFor="create-max-players"><Users aria-hidden="true" size={17} /> {translate("Số người chơi tối đa", "Maximum players")}</label>
          <select id="create-max-players" className="ww-input px-4" value={maxPlayers} disabled={pending || createdRoomCode !== null} onChange={event => onMaxPlayersChange(Number(event.target.value))}>
            {capacities.map(value => <option key={value} value={value}>{value} {translate("người chơi", "players")}</option>)}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ww-text-3)]">{translate("Phòng mặc định bắt đầu với sức chứa 6 người. Host có thể cập nhật sức chứa lớn hơn sau khi tạo phòng.", "Rooms start at a capacity of 6 by default. The Host can update to a larger capacity after creation.")}</p>
          {error && <div className="ww-alert-danger mt-4 rounded-xl p-3 text-sm" role="alert">{error}</div>}
          <GameButton type="submit" icon={PlusCircle} className="ww-button-cta mt-5" disabled={pending}>
            {pending ? translate("Đang tạo phòng...", "Creating room...") : createdRoomCode ? translate("Thử lại sức chứa phòng", "Retry room capacity") : translate("Tạo phòng", "Create room")}
          </GameButton>
          {createdRoomCode && <GameButton type="button" variant="secondary" className="ww-button-cta mt-3" onClick={onContinueWithDefault}>{translate("Tiếp tục với 6 người chơi", "Continue with 6 players")}</GameButton>}
        </form>
        <p className="mt-6 flex items-start justify-center gap-2 text-left text-xs leading-relaxed text-[var(--ww-text-3)]"><LockKeyhole aria-hidden="true" className="mt-0.5 shrink-0" size={14} /> {translate("Quyền Host được giữ trong tab trình duyệt này, không được đưa vào URL hoặc hiển thị trên màn hình.", "Host access stays in this browser tab and is never placed in the URL or rendered on screen.")}</p>
      </GameCard>
    </GameShell>
  )
}
