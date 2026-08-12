import { Languages } from "lucide-react"
import { useLanguage } from "../contexts/LanguageProvider"

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage()
  const next = lang === "vi" ? "en" : "vi"
  const label = lang === "vi" ? t("switchToEnglish") : t("switchToVietnamese")

  return (
    <button type="button" className="ww-button ww-button-compact ww-button-secondary ww-language-toggle" onClick={() => setLang(next)} aria-label={label} title={label}>
      <Languages aria-hidden="true" size={16} />
      <span>{lang.toUpperCase()}</span>
    </button>
  )
}
