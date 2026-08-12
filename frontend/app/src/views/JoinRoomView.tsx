import { ArrowLeft, CircleAlert, KeyRound, LogIn, UserRound } from "lucide-react"
import { Link } from "react-router-dom"
import { routePaths } from "../app/routePaths"
import { GameShell } from "../components/game-ui/GameShell"
import { useLanguage } from "../contexts/LanguageProvider"

type JoinRoomViewProps = {
  roomCode: string
  playerName: string
  pending: boolean
  error: string | null
  onPlayerNameChange: (value: string) => void
  onSubmit: () => void
}

export default function JoinRoomView({
  roomCode,
  playerName,
  pending,
  error,
  onPlayerNameChange,
  onSubmit,
}: JoinRoomViewProps) {
  const { translate } = useLanguage()
  return (
    <GameShell>
      <span className="sr-only">{translate("Phòng", "Room")} {roomCode}</span>
      <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center py-8">
      <div className="ww-join-panel ww-reveal">
        <aside className="ww-join-art" aria-label={translate("Ma Sói trong khu rừng dưới ánh trăng", "Werewolf in a moonlit forest")}>
          <div className="ww-join-art-copy">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-200">{translate("Đang chờ người chơi...", "Waiting for players...")}</p>
            <p className="mt-3 max-w-sm text-lg leading-relaxed text-white">{translate("Công lý sẽ được thực thi khi màn đêm buông xuống. Liệu sói sẽ làm chủ cuộc chơi?", "Justice will be tested when night falls. Will the wolves take control?")}</p>
          </div>
        </aside>
        <section className="ww-join-form">
          <p className="ww-badge ww-badge-gold px-4 py-2 text-xs uppercase tracking-[.12em]">
            <KeyRound aria-hidden="true" size={15} /> {translate("Phòng", "Room")}: #{roomCode}
          </p>
          <h1 className="ww-display mt-6 text-4xl text-[var(--ww-text)] sm:text-5xl">{translate("Tham gia phòng", "Join room")}</h1>
          <p className="mt-3 text-[var(--ww-text-2)]">{translate("Nhập tên để tham gia cùng mọi người trong ván đấu này.", "Enter your name to join everyone in this game.")}</p>
        <form
          onSubmit={event => {
            event.preventDefault()
            onSubmit()
          }}
          aria-label={translate("Tham gia phòng", "Join room")}
          noValidate
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[var(--ww-text-2)]" htmlFor="player-name">
              {translate("Tên người chơi", "Player name")}
            </label>
            <div className="relative">
              <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ww-text-2)]" size={21} />
              <input
              id="player-name"
              aria-label={translate("Tên người chơi", "Player name")}
              className="ww-input min-h-16 pl-12 pr-4 text-lg"
              value={playerName}
              maxLength={30}
              autoComplete="nickname"
              onChange={event => onPlayerNameChange(event.target.value)}
              placeholder={translate("Ví dụ: Kẻ Giấu Mặt", "Example: Hidden Stranger")}
              aria-invalid={error !== null}
              aria-describedby={error ? "join-error" : undefined}
              disabled={pending}
              />
            </div>
            {error && (
              <p id="join-error" className="mt-2 text-sm text-[var(--ww-error)] text-center" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="ww-inset-surface flex gap-3 rounded-lg p-4 text-sm leading-relaxed text-[var(--ww-text-2)]">
            <CircleAlert aria-hidden="true" className="ww-text-warning mt-0.5 shrink-0" size={19} />
            <p><strong className="block text-[var(--ww-text)]">{translate("Quy định phòng chơi", "Room rules")}</strong>{translate("Vui lòng không sử dụng ngôn từ thô tục. Người chơi vi phạm có thể bị chủ phòng trục xuất.", "Please avoid offensive language. The Host may remove players who violate the room rules.")}</p>
          </div>

          <button
            type="submit"
              aria-label={translate("Vào phòng", "Enter room")}
            className="ww-button ww-button-cta ww-button-primary"
            disabled={pending}
          >
            {pending ? translate("Đang vào phòng...", "Entering room...") : translate("Vào phòng", "Enter room")} <LogIn aria-hidden="true" size={20} />
          </button>
        </form>
        <Link className="ww-button ww-button-ghost mt-4 w-full" to={routePaths.home}><ArrowLeft aria-hidden="true" size={18} /> {translate("Quay lại", "Back")}</Link>
        </section>
      </div>
      </div>
    </GameShell>
  )
}
