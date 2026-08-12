import type { PlayerListProps } from "../config/playerLobbyTypes"
import { useLanguage } from "../contexts/LanguageProvider"

export function PlayerList({ players, maxPlayers, currentPlayerId }: PlayerListProps) {
  const { translate } = useLanguage()
  const emptySlotsCount = Math.max(0, maxPlayers - players.length)
  const emptySlots = Array.from({ length: emptySlotsCount })
  const full = players.length >= maxPlayers

  return (
    <section aria-label={translate("Người chơi", "Players")} className="w-full">
      {/* Screen-reader-only headings for accessibility and DOM tests */}
      <div className="sr-only">
        <p>{full ? translate("Phòng đã đầy", "Room full") : `${translate("Đang chờ người chơi", "Waiting for players")} (${players.length}/${maxPlayers})`}</p>
        {players.length === 0 && (
          <div role="status">{translate("Đang chờ người chơi. Chia sẻ mã phòng hoặc mã QR để mời thêm người vào làng.", "Waiting for players. Share the room code or QR invitation to fill the village.")}</div>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {players.map((player, index) => (
          <li
            className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-[var(--ww-border)] bg-[var(--ww-surface-2)] px-4 py-3 sm:px-5"
            key={player.playerId}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="sr-only">{index + 1}</span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-[var(--ww-text)] text-lg">
                  {player.playerName}
                  {player.playerId === currentPlayerId ? ` (${translate("bạn", "you")})` : ""}
                  <span className="sr-only">
                    {player.isConnected ? translate("Đã kết nối", "Connected") : translate("Ngoại tuyến", "Offline")}
                  </span>
                </span>
              </div>
            </div>
            <span className={`text-sm font-bold uppercase tracking-wider ${player.ready ? "text-[var(--ww-gold)]" : "text-[var(--ww-text-3)]"}`}>
              {player.ready ? translate("Sẵn sàng", "Ready") : translate("Chưa sẵn sàng", "Unready")}
            </span>
          </li>
        ))}
        {emptySlots.map((_, index) => (
          <li
            className="flex min-h-14 items-center justify-between rounded-xl border border-[var(--ww-border)] bg-transparent px-4 py-3 opacity-20 sm:px-5"
            key={`empty-${index}`}
          >
            <span className="sr-only">{translate("Vị trí", "Slot")} {players.length + index + 1}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

