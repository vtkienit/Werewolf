import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, ChevronUp } from "lucide-react"
import { PlayerList } from "../../../components/PlayerList"
import RoomInformationPanel from "../../../components/room/RoomInformationPanel"
import type { PlayerListSnapshot } from "../../../config/playerLobbyTypes"
import type { MaxPlayersControlProps } from "./MaxPlayersControl"
import type { HostRoomPresentation } from "../types/hostRoomShell"
import type { HostGameController } from "../../game-setup/hooks/useHostGame"
import type { GameSetupRole } from "../../game-setup/types/gameSetup.types"
import { routePaths } from "../../../app/routePaths"
import ActiveRoleCard from "../../roles/ActiveRoleCard"
import { useLanguage } from "../../../contexts/LanguageProvider"

type HostRoomShellProps = {
  presentation: HostRoomPresentation
  maxPlayersControl: MaxPlayersControlProps
  snapshot: PlayerListSnapshot | null
  gameActive: boolean
  routeContent: ReactNode
  hasReview?: boolean
  showRouteOnly?: boolean
  game?: HostGameController
  roles?: GameSetupRole[]
}

export default function HostRoomShell({
  presentation,
  maxPlayersControl,
  snapshot,
  gameActive,
  routeContent,
  hasReview = false,
  showRouteOnly = false,
  game,
  roles,
}: HostRoomShellProps) {
  const { translate } = useLanguage()
  const { status, roomCode, joinUrl, error } = presentation

  const handleIncrement = () => {
    if (maxPlayersControl.draft < 12 && !maxPlayersControl.disabled && !maxPlayersControl.loading) {
      const nextValue = maxPlayersControl.draft + 1
      maxPlayersControl.onDraftChange(nextValue)
      maxPlayersControl.onSubmit(nextValue)
    }
  }

  const handleDecrement = () => {
    if (maxPlayersControl.draft > Math.max(6, maxPlayersControl.playerCount) && !maxPlayersControl.disabled && !maxPlayersControl.loading) {
      const nextValue = maxPlayersControl.draft - 1
      maxPlayersControl.onDraftChange(nextValue)
      maxPlayersControl.onSubmit(nextValue)
    }
  }

  const activeRoles = roles && game
    ? roles.filter(role => (game.quantities[role.roleId] ?? 0) > 0)
    : []

  if (status === "error") {
    return (
      <main className="ww-page">
        <div className="ww-content-frame space-y-6">
          <div role="alert" className="ww-alert-danger rounded-2xl p-5">
            {error?.message ?? translate("Phòng Host hiện không khả dụng.", "Host room is unavailable.")}
          </div>
        </div>
      </main>
    )
  }

  if (gameActive || showRouteOnly) {
    return (
      <main className="ww-page">
        <div className="ww-content-frame space-y-6">{routeContent}</div>
      </main>
    )
  }

  return (
    <main className="ww-page">
      <h1 className="sr-only">{translate("Phòng Host", "Host room")}</h1>
      <div className="ww-content-frame space-y-6 sm:space-y-8">
        <div className="ww-room-dashboard" data-testid="host-room-overview">
          <section aria-label={translate("Người chơi trong phòng", "Room players")} className="ww-card ww-room-players-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex flex-wrap items-center gap-3 text-xl font-black uppercase tracking-wide text-[var(--ww-text)] sm:text-2xl">
                <span>{translate("Số lượng người chơi:", "Players:")}</span>
                <span className="font-mono text-[var(--ww-gold)]">{maxPlayersControl.playerCount}/{maxPlayersControl.draft}</span>
              </h2>
              <div className="flex items-center gap-1" aria-label={translate("Số người chơi tối đa", "Maximum players")}>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={maxPlayersControl.disabled || maxPlayersControl.draft >= 12 || maxPlayersControl.loading}
                  className="ww-button-icon ww-focus grid place-items-center hover:bg-[var(--ww-surface-3)] hover:text-[var(--ww-gold)] disabled:opacity-60"
                  aria-label={translate("Tăng số người chơi tối đa", "Increase maximum players")}
                >
                  <ChevronUp aria-hidden="true" size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={maxPlayersControl.disabled || maxPlayersControl.draft <= Math.max(6, maxPlayersControl.playerCount) || maxPlayersControl.loading}
                  className="ww-button-icon ww-focus grid place-items-center hover:bg-[var(--ww-surface-3)] hover:text-[var(--ww-gold)] disabled:opacity-60"
                  aria-label={translate("Giảm số người chơi tối đa", "Decrease maximum players")}
                >
                  <ChevronDown aria-hidden="true" size={20} />
                </button>
              </div>
            </div>

            <div className="mt-5 min-h-0 flex-1">
              {snapshot ? (
                <PlayerList players={snapshot.players} maxPlayers={snapshot.maxPlayers} />
              ) : (
                <div role="status" aria-busy="true" className="rounded-2xl border border-dashed border-[var(--ww-border-strong)] p-8 text-center text-[var(--ww-text-2)]">
                  {translate("Đang chờ người chơi...", "Waiting for players...")}
                </div>
              )}
            </div>
          </section>

          <aside className="ww-room-sidebar" aria-label={translate("Điều khiển phòng Host", "Host room controls")}>
            <RoomInformationPanel roomCode={roomCode} joinUrl={joinUrl} />
            <Link to={routePaths.hostSetup(roomCode)} className="ww-button ww-button-cta ww-button-secondary">{translate("Thiết lập vai trò", "Set up roles")}</Link>
            <button type="button" onClick={() => { if (game?.start) void game.start() }} disabled={!game?.canStart || game?.pending} className="ww-button ww-button-cta ww-button-primary">
              {game?.pending ? translate("Đang bắt đầu ván...", "Starting game...") : translate("Bắt đầu ván", "Start game")}
            </button>
            {!game?.canStart && <p className="ww-text-danger text-center text-xs">{translate("Cần ít nhất 6 người chơi, tất cả đã sẵn sàng và thiết lập đã xác nhận có số vai khớp với số người chơi.", "Starting requires at least 6 players, everyone ready, and a confirmed setup matching the player count.")}</p>}
            {hasReview && <Link to={routePaths.hostRoundNote(roomCode)} className="ww-review-action">{translate("Xem lại ván trước", "Review previous game")}</Link>}
            {activeRoles.length > 0 && (
              <section className="ww-room-sidebar__roles space-y-3" aria-labelledby="host-active-roles-heading">
                <h2 id="host-active-roles-heading" className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-text-3)]">{translate("Vai trò đang dùng", "Active roles")}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {activeRoles.map(role => <ActiveRoleCard key={role.roleId} roleId={role.roleId} fallbackName={role.name} quantity={game?.quantities[role.roleId] ?? 0} />)}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
      {routeContent}
    </main>
  )
}
