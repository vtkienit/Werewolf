import { useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import ThemeToggle from "../components/ThemeToggle"
import LanguageToggle from "../components/LanguageToggle"
import GameFooter from "../components/GameFooter"
import { clearHowToPlayOrigin, isActiveRoomOrigin, isActiveRoomPath, loadHowToPlayOrigin, locationOrigin, stateOrigin, storeHowToPlayOrigin } from "../app/howToPlayOrigin"
import { useLanguage } from "../contexts/LanguageProvider"

export default function AppLayout() {
  const location = useLocation()
  const howToPlayOpen = location.pathname === "/" && location.hash === "#how-to-play"
  const preservedOrigin = howToPlayOpen ? stateOrigin(location.state) ?? loadHowToPlayOrigin() : null
  const roomContext = isActiveRoomPath(location.pathname) || isActiveRoomOrigin(preservedOrigin)
  const origin = locationOrigin(location)
  const { t } = useLanguage()

  useEffect(() => {
    if (!howToPlayOpen) clearHowToPlayOrigin()
  }, [howToPlayOpen])

  return (
    <div className="ww-app-shell">
      <header className="ww-global-header">
        <div className="ww-global-header__inner">
          {roomContext
            ? <span className="ww-global-header__brand">{t("werewolfBrand")}</span>
            : <Link className="ww-global-header__brand" to="/">{t("werewolfBrand")}</Link>}
          <div className="ww-global-header__actions">
            {howToPlayOpen
              ? <span className="ww-global-header__guide" aria-current="page">{t("howToPlay")}</span>
              : (
                <Link
                  className="ww-global-header__guide"
                  to={{ pathname: "/", hash: "#how-to-play" }}
                  state={{ howToPlayOrigin: origin }}
                  onClick={() => storeHowToPlayOrigin(origin)}
                >
                  {t("howToPlay")}
                </Link>
              )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="ww-app-content"><Outlet /></div>
      <GameFooter />
    </div>
  )
}
