import { useLanguage } from "../contexts/LanguageProvider"

export default function GameFooter() {
  const { t } = useLanguage()

  return (
    <footer className="ww-global-footer">
      <div className="ww-global-footer__inner">
        <div>
          <strong className="ww-display text-[var(--ww-text)]">{t("werewolfBrand")}</strong>
          <p className="mt-1 text-xs text-[var(--ww-text-3)]">{t("copyright")}</p>
        </div>
        <nav className="ww-global-footer__links" aria-label={t("contactUs")}>
          <span>{t("terms")}</span>
          <span>{t("privacyPolicy")}</span>
          <span>{t("contactUs")}</span>
        </nav>
      </div>
    </footer>
  )
}
