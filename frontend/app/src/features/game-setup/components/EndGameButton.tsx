type EndGameButtonProps = {
  disabled?: boolean
  pending: boolean
  retry: boolean
  onClick: () => void
}

export default function EndGameButton({ disabled, pending, retry, onClick }: EndGameButtonProps) {
  const { translate } = useLanguage()
  const ariaLabel = pending ? translate("Đang kết thúc ván", "Ending game") : retry ? translate("Thử lại kết thúc ván", "Retry ending game") : translate("Kết thúc ván", "End game")
  return (
    <button
      type="button"
      className="ww-button ww-button-cta ww-button-danger"
      disabled={disabled || pending}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span>{pending ? translate("Đang kết thúc ván...", "Ending game...") : translate("Kết thúc trận và lưu lại", "End and save game")}</span>
    </button>
  )
}
import { useLanguage } from "../../../contexts/LanguageProvider"
