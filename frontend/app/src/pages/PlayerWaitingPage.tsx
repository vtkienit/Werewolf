import { useState } from "react"
import { Check, Loader2, Trophy, X } from "lucide-react"
import { PlayerList } from "../components/PlayerList"
import { ConnectionBadge, GameShell } from "../components/game-ui/GameShell"
import RoomInformationPanel from "../components/room/RoomInformationPanel"
import { createJoinUrl } from "../features/host-room/utils/createJoinUrl"
import { usePlayerRouteContext } from "./PlayerRoomPage"
import ActiveRoleCard from "../features/roles/ActiveRoleCard"
import { useLanguage } from "../contexts/LanguageProvider"

export default function PlayerWaitingPage() {
  const { translate } = useLanguage()
  const { roomCode, snapshot, connectionState, player, setReady, readyPending, readyError } = usePlayerRouteContext()
  const [reviewOpen, setReviewOpen] = useState(false)
  const current = snapshot?.players.find(item => item.playerId === player.playerId)
  const joinUrl = createJoinUrl(roomCode)
  const currentPlayers = snapshot?.currentPlayers ?? 0
  const maxPlayers = snapshot?.maxPlayers ?? 6

  return (
    <GameShell>
      <h1 className="sr-only">{translate("Đang chờ Host", "Waiting for the Host")}</h1>
      <header className="mb-6 flex justify-end"><ConnectionBadge state={connectionState} /></header>

      <div className="ww-room-dashboard" data-testid="player-room-overview">
          <section aria-label={translate("Người chơi trong phòng", "Room players")} className="ww-card ww-room-players-panel">
            <h2 className="flex flex-wrap items-center gap-3 text-xl font-black uppercase tracking-wide text-[var(--ww-text)] sm:text-2xl">
              <span>{translate("Số lượng người chơi:", "Players:")}</span>
              <span className="font-mono text-[var(--ww-gold)]">{currentPlayers}/{maxPlayers}</span>
            </h2>

            <div className="mt-5 min-h-0 flex-1">
              {snapshot ? (
                <PlayerList players={snapshot.players} maxPlayers={snapshot.maxPlayers} currentPlayerId={player.playerId} />
              ) : (
                <div role="status" aria-busy="true" className="rounded-2xl border border-dashed border-[var(--ww-border-strong)] p-8 text-center text-[var(--ww-text-2)]">
                  {translate("Đang tải trạng thái phòng chờ...", "Waiting for lobby snapshot...")}
                </div>
              )}
            </div>
          </section>

        <aside className="ww-room-sidebar" aria-label={translate("Điều khiển phòng người chơi", "Player room controls")}>
          <RoomInformationPanel roomCode={roomCode} joinUrl={joinUrl} />
          {snapshot?.status === "WAITING" && current && setReady ? (
            <div className="space-y-3">
              <button
                type="button"
                className={`ww-ready-control ${current.ready ? "ww-ready-control--ready" : ""}`}
                disabled={readyPending}
                onClick={() => void setReady(!current.ready)}
                aria-busy={readyPending || undefined}
                aria-label={readyPending ? translate("Đang cập nhật trạng thái sẵn sàng", "Updating ready status") : current.ready ? translate("Đã sẵn sàng", "Ready") : translate("Sẵn sàng", "Get ready")}
              >
                {readyPending
                  ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" size={21} />
                  : <Check aria-hidden="true" size={21} />}
                <span className="flex flex-col items-start text-left">
                  <strong>{readyPending ? translate("Đang cập nhật...", "Updating...") : current.ready ? translate("Đã sẵn sàng", "Ready") : translate("Sẵn sàng", "Get ready")}</strong>
                  <small>{current.ready ? translate("Nhấn để hủy trạng thái sẵn sàng.", "Press to cancel your ready status.") : translate("Xác nhận bạn đã sẵn sàng bắt đầu ván.", "Confirm that you are ready to start the game.")}</small>
                </span>
              </button>
              {readyError && <p role="alert" className="ww-text-danger mt-2 text-center text-sm">{readyError}</p>}
            </div>
          ) : (
            <div className="ww-card p-4 text-center text-sm text-[var(--ww-text-3)]">{translate("Chỉ có thể thay đổi trạng thái sẵn sàng khi phòng đang chờ.", "Ready status can only be changed while the room is waiting.")}</div>
          )}

        {snapshot?.lastCompletedGame && (
          <div className="space-y-3">
            <button type="button" className="ww-review-action" aria-expanded={reviewOpen} aria-controls="player-game-review" onClick={() => setReviewOpen(open => !open)}>
              <Trophy aria-hidden="true" size={18} /> {translate("Xem lại ván trước", "Review previous game")}
            </button>
            {reviewOpen && (
              <section id="player-game-review" className="ww-card p-5" aria-labelledby="player-review-heading">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ww-gold)]">{translate("Ván đã kết thúc", "Completed game")}</p>
                    <h2 id="player-review-heading" className="ww-display mt-1 text-2xl text-[var(--ww-text)]">{translate("Xem lại ván trước", "Previous game review")}</h2>
                    <p className="mt-2 text-sm font-bold text-[var(--ww-text-2)]">{translate("Phe chiến thắng", "Winning side")}: {snapshot.lastCompletedGame.winningSide}</p>
                  </div>
                  <button type="button" className="ww-button-icon ww-focus grid shrink-0 place-items-center border border-[var(--ww-border)] text-[var(--ww-text-2)]" onClick={() => setReviewOpen(false)} aria-label={translate("Đóng phần xem lại ván trước", "Close previous game review")}>
                    <X aria-hidden="true" size={18} />
                  </button>
                </div>
                <div className="mt-5 grid gap-4">
                  {snapshot.lastCompletedGame.roles.map(role => <ActiveRoleCard key={role.roleId} roleId={role.roleId} fallbackName={role.roleId} quantity={role.quantity} />)}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="ww-room-sidebar__roles space-y-3" aria-labelledby="player-active-roles-heading">
          <h2 id="player-active-roles-heading" className="text-xs font-bold uppercase tracking-[.18em] text-[var(--ww-text-3)]">{translate("Vai trò đang dùng", "Active roles")}</h2>
          {!snapshot ? (
            <div className="ww-card p-5" role="status" aria-busy="true"><div className="h-24 animate-pulse rounded-xl bg-[var(--ww-surface-2)] motion-reduce:animate-none" /></div>
          ) : (snapshot.activeRoles?.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--ww-border-strong)] p-5 text-sm text-[var(--ww-text-2)]">{translate("Host chưa xác nhận thiết lập vai trò.", "The Host has not confirmed a role setup yet.")}</p>
          ) : (
            <div className="grid gap-3">{snapshot.activeRoles!.map(role => <ActiveRoleCard key={role.roleId} roleId={role.roleId} fallbackName={role.roleId} quantity={role.quantity} />)}</div>
          )}
        </section>
        </aside>
      </div>
    </GameShell>
  )
}
