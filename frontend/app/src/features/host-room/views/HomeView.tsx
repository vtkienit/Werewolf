import { Link } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import { useLanguage } from "../../../contexts/LanguageProvider"

type HomeViewProps = {
  roomCode: string
  error: string | null
  onRoomCodeChange: (value: string) => void
  onJoin: () => void
}

export default function HomeView({ roomCode, error, onRoomCodeChange, onJoin }: HomeViewProps) {
  const { translate } = useLanguage()
  return (
    <main className="ww-page ww-home-page">
      <div className="ww-fog" aria-hidden="true" />
      <div className="ww-home-stage">
        <div className="ww-home-layout ww-reveal">
          <section className="ww-home-copy">
            <h1 className="ww-home-title"><span className="sr-only">Ma Sói Online: </span>{translate("Đêm nay,", "Tonight,")} <strong>{translate("Ai sẽ là kẻ bị săn?", "who will be hunted?")}</strong></h1>
            <p className="mt-5 max-w-[34rem] text-base leading-relaxed text-[var(--ww-text-2)]">
              {translate("Trải nghiệm trò chơi Ma Sói kinh điển phiên bản trực tuyến. Chiến thuật, lừa dối và suy luận để giành chiến thắng.", "Experience the classic Werewolf game online. Use strategy, deception, and deduction to claim victory.")}
            </p>
            <div className="ww-home-actions mt-7 space-y-3">
              <Link
                to={routePaths.hostCreate}
                aria-label={translate("Tạo phòng mới", "Create a new room")}
                className="ww-button ww-button-cta ww-button-primary"
              >
                {translate("Tạo phòng mới", "Create a new room")}
              </Link>
              <form
                onSubmit={event => {
                  event.preventDefault()
                  onJoin()
                }}
                noValidate
                aria-label={translate("Tham gia phòng", "Join a room")}
                className="flex w-full items-stretch gap-0"
              >
                <label className="sr-only" htmlFor="home-room-code">{translate("Mã phòng", "Room code")}</label>
                <input
                  id="home-room-code"
                  className="ww-input min-h-12 min-w-0 flex-1 rounded-r-none px-5 font-mono uppercase tracking-wider"
                  value={roomCode}
                  onChange={event => onRoomCodeChange(event.target.value)}
                  placeholder={translate("Nhập mã phòng", "Enter room code")}
                  autoComplete="off"
                  inputMode="text"
                  maxLength={8}
                />
                <button
                  type="submit"
                  aria-label={translate("Tham gia phòng", "Join room")}
                  className="ww-button ww-button-primary min-w-28 rounded-l-none"
                >
                  {translate("Tham gia", "Join")}
                </button>
              </form>
              {error && <p id="home-room-code-error" className="mt-2 text-sm text-[var(--ww-error)]" role="alert">{error}</p>}
            </div>
          </section>

          <aside className="ww-home-art" aria-label={translate("Các lá bài Midnight Phantasm", "Midnight Phantasm role cards")}>
            <img src="/midnight-cards.png" alt={translate("Các lá bài vai trò Ma Sói phong cách Midnight Phantasm", "Werewolf role cards in the Midnight Phantasm style")} />
          </aside>
        </div>
      </div>
    </main>
  )
}
