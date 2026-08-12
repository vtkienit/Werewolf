import { GameShell } from "../../../components/game-ui/GameShell"
import { ArrowLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { clearHowToPlayOrigin, loadHowToPlayOrigin, stateOrigin } from "../../../app/howToPlayOrigin"
import { useLanguage } from "../../../contexts/LanguageProvider"

export default function HowToPlayPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { translate } = useLanguage()
  const steps = [
    ["1", translate("Tạo hoặc tham gia phòng", "Create or join a room"), translate("Host tạo phòng và chia sẻ mã. Người chơi tham gia bằng tên hiển thị của mình.", "The Host creates a room and shares its code. Players join using their display name.")],
    ["2", translate("Chuẩn bị vai trò", "Prepare the roles"), translate("Host chọn vai cho ván đấu. Người chơi xác nhận trạng thái sẵn sàng trong phòng chờ.", "The Host selects roles for the game. Players confirm they are ready in the lobby.")],
    ["3", translate("Bắt đầu ván", "Start the game"), translate("Khi thiết lập đã xác nhận và mọi người sẵn sàng, Host bắt đầu. Mỗi người chỉ xem được vai bí mật của chính mình.", "Once the setup is confirmed and everyone is ready, the Host starts the game. Each player can only see their own secret role.")],
    ["4", translate("Chơi theo vòng", "Play through rounds"), translate("Host điều phối đêm và ngày, lưu ghi chú vòng, chọn phe chiến thắng rồi kết thúc ván.", "The Host guides night and day, saves round notes, selects the winning faction, and ends the game.")],
  ]

  function returnToOrigin() {
    const origin = stateOrigin(location.state) ?? loadHowToPlayOrigin()
    if (origin) {
      clearHowToPlayOrigin()
      navigate(origin)
      return
    }
    if (location.key !== "default" && typeof window.history.state?.idx === "number" && window.history.state.idx > 0) {
      navigate(-1)
      return
    }
    navigate("/")
  }

  return (
    <GameShell>
      <section className="mx-auto max-w-5xl py-10 sm:py-16" aria-labelledby="how-to-play-title">
        <button type="button" className="ww-button ww-button-ghost mb-6" onClick={returnToOrigin}>
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={2} /> {translate("Quay lại", "Back")}
        </button>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]">{translate("Hướng dẫn nhanh", "Quick guide")}</p>
        <h1 id="how-to-play-title" className="ww-display mt-3 text-4xl text-[var(--ww-text)] sm:text-6xl">{translate("Cách chơi", "How to play")}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--ww-text-2)]">{translate("Một ván Ma Sói trực tuyến vẫn giữ nhịp chơi trực tiếp: Host điều phối, còn vai trò và danh tính bí mật luôn thuộc về từng người chơi.", "Online Werewolf keeps the rhythm of an in-person game: the Host guides play while every player's role and identity remain private.")}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {steps.map(([number, title, description]) => (
            <article className="ww-card p-5 sm:p-6" key={number}>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ww-border-strong)] text-sm font-black text-[var(--ww-gold)]">{number}</span>
              <h2 className="mt-5 text-xl font-black text-[var(--ww-text)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ww-text-2)]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </GameShell>
  )
}
