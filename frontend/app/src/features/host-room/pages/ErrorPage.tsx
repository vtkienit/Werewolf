import { Ghost, Home } from "lucide-react"
import { Link } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import { GameCard } from "../../../components/game-ui/GamePrimitives"
import { GameShell } from "../../../components/game-ui/GameShell"
import { useLanguage } from "../../../contexts/LanguageProvider"

export default function ErrorPage() {
  const { translate } = useLanguage()
  return (
    <GameShell narrow center>
      <GameCard className="ww-reveal p-7 text-center sm:p-9" glow="crimson">
        <span className="ww-alert-danger mx-auto grid h-20 w-20 place-items-center rounded-2xl"><Ghost aria-hidden="true" size={40} /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-gold)]">404</p>
        <h1 className="ww-display mt-2 text-3xl text-[var(--ww-text)]">{translate("Không tìm thấy trang", "Page not found")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ww-text-2)]">{translate("Đường dẫn này không thuộc ngôi làng. Không có chi tiết lỗi nội bộ nào được hiển thị tại đây.", "This path is not part of the village. No internal error details are available here.")}</p>
        <Link className="ww-button ww-button-cta ww-button-primary mt-7" to={routePaths.home}><Home aria-hidden="true" size={18} /> {translate("Về trang chủ", "Back to home")}</Link>
      </GameCard>
    </GameShell>
  )
}
