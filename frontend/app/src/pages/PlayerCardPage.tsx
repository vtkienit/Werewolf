import { useEffect, useRef } from "react"
import { Navigate } from "react-router-dom"
import { routePaths } from "../app/routePaths"
import { ConnectionBadge, GameShell } from "../components/game-ui/GameShell"
import { StatusBadge } from "../components/game-ui/GamePrimitives"
import { usePlayerRouteContext } from "./PlayerRoomPage"
import { characters } from "../data/characters"
import { EyeOff, RotateCcw, Moon } from "lucide-react"
import { RoleArtwork } from "../features/roles/roleArtwork"
import { useLanguage } from "../contexts/LanguageProvider"
import { localizedCharacterAbility } from "../data/characterEnglishCopy"

export default function PlayerCardPage() {
  const { lang, translate } = useLanguage()
  const { roomCode, connectionState, gameState, revealRole, hideRole, returnToWaiting } = usePlayerRouteContext()
  const actionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    actionRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
  }, [gameState.status])

  if (gameState.status === "WAITING_FOR_GAME") {
    return <Navigate to={routePaths.playerWaiting(roomCode)} replace />
  }

  const character = characters.find(candidate => candidate.id === gameState.roleId)
  if (!character) {
    return (
      <GameShell narrow>
        <section role="alert" className="ww-alert-danger mx-auto w-full max-w-md rounded-2xl p-5 text-center sm:p-8">
          <h2 className="text-xl font-bold">{translate("Không có thông tin vai trò", "Role details are unavailable")}</h2>
          <p className="mt-2">{translate("Quay lại phòng chờ và yêu cầu Host thử lại.", "Return to the waiting room and ask the Host to try again.")}</p>
          {returnToWaiting && (
            <button type="button" onClick={returnToWaiting} className="ww-button ww-button-danger mt-5">
              {translate("Quay lại phòng chờ", "Return to waiting room")}
            </button>
          )}
        </section>
      </GameShell>
    )
  }

  const isRevealed = gameState.status === "ROLE_REVEALED"
  const isReview = gameState.status === "ROLE_HIDDEN"

  // Team mappings for styling and labels
  const teamNameVi = character.team === "werewolf"
    ? "Ma Sói"
    : character.team === "village"
    ? "Dân Làng"
    : character.team === "vampire"
    ? "Ma Cà Rồng"
    : "Thứ Ba"
  const teamName = lang === "vi" ? teamNameVi : character.team === "werewolf" ? "Werewolves" : character.team === "village" ? "Village" : character.team === "vampire" ? "Vampires" : "Third party"
  const roleName = lang === "en" ? character.nameEn || character.name : character.name

  const accentColor = character.team === "werewolf"
    ? "ww-private-role-card--werewolf text-[var(--ww-faction-werewolf)]"
    : character.team === "village"
    ? "ww-private-role-card--village text-[var(--ww-faction-village)]"
    : "ww-private-role-card--other text-[var(--ww-faction-other)]"
  const cardAppearance = isRevealed
    ? accentColor
    : "ww-private-role-card--hidden text-[var(--ww-faction-night)]"

  return (
    <GameShell narrow>
      <h1 className="sr-only">{translate("Lá bài vai trò riêng tư", "Private role card")}</h1>
      <div className="mx-auto w-full max-w-sm flex flex-col items-center">
        {/* Top Badges */}
        <div className="w-full mb-6 flex items-center justify-between gap-3">
          <StatusBadge tone="gold">{translate("Phòng", "Room")}: {roomCode}</StatusBadge>
          <ConnectionBadge state={connectionState} />
        </div>

        {/* The Card */}
        <div className={`ww-private-role-card relative flex aspect-[3/4.2] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-8 text-center transition-colors duration-200 ${cardAppearance}`}>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-[var(--ww-text-2)] opacity-85">
            {translate("VAI CỦA BẠN", "YOUR ROLE")}
          </p>

          {isRevealed ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full animate-fade-in">
              <RoleArtwork roleId={character.id} roleName={roleName} eager className="mt-5 h-44 w-36 rounded-2xl" />
              <h2 className="ww-display mt-6 break-words text-3xl font-extrabold tracking-tight text-[var(--ww-text)]">
                {roleName}
              </h2>
              <p className="ww-team-badge mt-3 rounded-full px-4 py-1.5 text-xs font-bold text-current">
                {translate("Phe", "Faction")} {teamName}
              </p>
              <p className="mt-6 break-words text-sm leading-relaxed text-[var(--ww-text-2)] max-w-[280px]">
                {localizedCharacterAbility(character, lang)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <div className="absolute inset-0 opacity-[.06] [background-image:repeating-linear-gradient(115deg,transparent_0_22px,rgba(255,255,255,.5)_22px_24px)]" aria-hidden="true" />
              <span className="grid h-24 w-24 place-items-center rounded-full bg-[radial-gradient(circle_at_38%_32%,_#f6ecc9,_#d8b458_55%,_#7c5f1a)] text-[#3a2a06] shadow-[0_0_60px_rgba(232,184,75,0.35)]">
                <Moon aria-hidden="true" size={46} />
              </span>
              <h2 className="ww-display mt-6 text-2xl text-[var(--ww-text)] font-bold">
                {translate("Lá bài đang ẩn", "Role card hidden")}
              </h2>
              <p className="ww-text-warning mt-3 max-w-[240px] text-xs leading-relaxed">
                {translate("Nhấp nút bên dưới để xem vai. Đảm bảo không ai nhìn màn hình của bạn.", "Press the button below to reveal your role. Make sure nobody can see your screen.")}
              </p>
              <span className="ww-display absolute bottom-8 text-xs tracking-[.28em] text-[var(--ww-gold)] opacity-40">
                IGNIFY
              </span>
            </div>
          )}
        </div>

        {/* Buttons (Side by Side matching Screenshot 7) */}
        <div ref={actionRef} className="flex gap-4 w-full mt-6 justify-center">
          <button
            type="button"
            aria-label={translate("Ẩn vai trò", "Hide role")}
            disabled={!isRevealed}
            onClick={hideRole}
            className="ww-button min-w-0 flex-1 ww-role-action"
          >
            <EyeOff aria-hidden="true" size={18} />
            <span>{translate("Ẩn vai", "Hide role")}</span>
          </button>

          <button
            type="button"
            aria-label={isReview ? translate("Xem lại vai trò", "Review role") : translate("Xem vai trò", "Reveal role")}
            disabled={isRevealed}
            onClick={revealRole}
            className="ww-button ww-button-primary min-w-0 flex-1"
          >
            <RotateCcw aria-hidden="true" size={18} />
            <span>{isReview ? translate("Xem lại vai", "Review role") : translate("Xem vai", "Reveal role")}</span>
          </button>
        </div>

        {/* Footer info box matching Screenshot 7 */}
        <div className="ww-private-role-footer mt-6 w-full rounded-2xl p-4 text-center text-xs leading-relaxed text-[var(--ww-text-3)]">
          {translate("Không hiển thị vai của người chơi khác. Trò chơi diễn ra trực tiếp bên ngoài ứng dụng.", "Other players' roles are never shown. The game takes place live outside the application.")}
        </div>
      </div>
    </GameShell>
  )
}
