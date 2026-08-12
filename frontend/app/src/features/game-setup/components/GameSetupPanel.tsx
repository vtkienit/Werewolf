import { useState } from "react"
import { ArrowLeft, Minus, MoonStar, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import RoleQuantityControl from "./RoleQuantityControl"
import type { HostGameController } from "../hooks/useHostGame"
import type { GameSetupPlayer, GameSetupRole } from "../types/gameSetup.types"
import { characters } from "../../../data/characters"
import { RoleArtwork } from "../../roles/roleArtwork"
import { validateRoleSetup } from "../utils/gameSetupValidation"
import { useLanguage } from "../../../contexts/LanguageProvider"

type GameSetupPanelProps = {
  roomCode: string
  players: GameSetupPlayer[]
  roles: GameSetupRole[]
  game: HostGameController
  onStarted?: () => void
  onEnded?: () => void
}

export default function GameSetupPanel({ roomCode, players, roles, game, onStarted, onEnded }: GameSetupPanelProps) {
  const { lang, translate } = useLanguage()
  const [query, setQuery] = useState("")
  const [team, setTeam] = useState("all")

  async function confirm() {
    if (await game.confirmRoleSetup()) onStarted?.()
  }

  const activeRoles = roles.filter(role => (game.quantities[role.roleId] ?? 0) > 0)
  const visibleRoles = roles.filter(
    role =>
      (team === "all" || role.team === team) &&
      `${role.name} ${role.roleId}`.toLowerCase().includes(query.trim().toLowerCase())
  )

  const teams = ["all", ...new Set(roles.map(role => role.team))]
  const setupValidation = validateRoleSetup(roles, game.quantities)
  const factionLabels: Record<string, string> = {
    all: translate("Tất cả", "All"),
    village: translate("Dân làng", "Village"),
    werewolf: translate("Sói", "Werewolves"),
    vampire: translate("Ma cà rồng", "Vampires"),
    other: translate("Khác", "Other"),
  }
  const totalSelectedRoles = Object.values(game.quantities).reduce((sum, quantity) => sum + quantity, 0)
  const validationMessage = lang === "vi"
    ? setupValidation.message
    : totalSelectedRoles < 6
    ? "Select at least 6 roles."
    : totalSelectedRoles > 12
    ? "Select no more than 12 roles."
    : setupValidation.valid
    ? "Select 6 to 12 valid roles to confirm the setup."
    : "One or more selected role quantities are invalid."

  // Calculate dynamic balance score
  const balanceScore = roles.reduce((sum, role) => {
    const qty = game.quantities[role.roleId] ?? 0
    const char = characters.find(c => c.id === role.roleId)
    return sum + (char?.value ?? 0) * qty
  }, 0)

  const balanceStatus = balanceScore === 0
    ? translate("Cân bằng tốt", "Well balanced")
    : balanceScore > 0
    ? translate("Dân làng lợi thế", "Village advantage")
    : translate("Sói lợi thế", "Werewolf advantage")

  const percentage = Math.min(100, Math.max(0, ((balanceScore + 15) / 30) * 100))

  return (
    <section aria-label={translate("Thiết lập ván đấu", "Game setup")} className="ww-game-setup-page w-full space-y-5">
      <h2 className="sr-only">{translate("Thiết lập ván đấu", "Game setup")}</h2>
      <header className="ww-game-setup-header flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="ww-brand-mark h-12 w-12 rounded-xl"><MoonStar aria-hidden="true" size={25} /></span>
          <div>
            <h1 className="text-2xl font-black text-[var(--ww-text)]">{translate("Quản Trò Ma Sói", "Werewolf Host Console")}</h1>
            <p className="text-sm text-[var(--ww-text-2)]">{translate("Phòng", "Room")} {roomCode} · {translate("Công cụ sắp ván và gợi ý vai trò", "Role setup and recommendation tool")}</p>
          </div>
        </div>
        {onEnded && (
          <button type="button" onClick={onEnded} className="ww-button ww-button-secondary">
            <ArrowLeft aria-hidden="true" size={18} /> {translate("Quay lại phòng", "Back to room")}
          </button>
        )}
      </header>

      <div className="ww-game-setup-layout">
        {/* Left Column: Role Library */}
        <section className="ww-card p-5 sm:p-6 space-y-5" aria-label={translate("Thư viện vai trò", "Role library")}>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-[var(--ww-text)]">{translate("Thư viện vai trò", "Role library")}</h2>
            <span className="shrink-0 text-sm text-[var(--ww-text-2)]">{roles.length} {translate("vai trò", "roles")}</span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ww-text-3)]" size={18} />
            <label className="sr-only" htmlFor="role-search">{translate("Tìm vai trò", "Search roles")}</label>
            <input
              id="role-search"
              className="ww-input pl-11 pr-4"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={translate("Tìm vai trò", "Search roles")}
              disabled={game.active || game.pending}
            />
          </div>

          {/* Faction filters tabs */}
          <div className="flex flex-wrap gap-2" aria-label={translate("Bộ lọc phe vai trò", "Role faction filters")}>
            {teams.map(val => (
              <button
                type="button"
                key={val}
                className={`ww-button ww-button-compact border transition-all ${
                  team === val
                    ? "ww-badge-gold border-[var(--ww-gold)]"
                    : "ww-badge-muted border-transparent"
                }`}
                onClick={() => setTeam(val)}
              >
                {factionLabels[val] ?? val}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {visibleRoles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ww-border-strong)] p-8 text-center text-[var(--ww-text-2)]">
              {translate("Không có vai trò phù hợp với tìm kiếm.", "No roles match this search.")}
            </div>
          ) : (
            <div className="grid items-stretch gap-4 md:grid-cols-2">
              {visibleRoles.map(role => (
                <RoleQuantityControl
                  key={role.roleId}
                  role={role}
                  quantity={game.quantities[role.roleId] ?? 0}
                  onChange={game.updateQuantity}
                  disabled={game.active || game.pending}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Setup Panel & Active Roles editor */}
        <aside className="ww-card ww-game-setup-sidebar space-y-4 p-5 lg:sticky lg:top-24 lg:self-start" aria-label={translate("Tóm tắt thiết lập", "Setup summary")}>
          {/* Header Ván Đấu */}
          <div className="ww-card p-5 space-y-4">
            <div className="ww-divider flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-[var(--ww-text)]">{translate("Ván đấu", "Game")}</h2>
              <span className="text-sm font-semibold text-[var(--ww-text-2)]">{players.length} {translate("người chơi", "players")}</span>
            </div>

            <button
              type="button"
              onClick={game.recommend}
              className="ww-button ww-button-secondary w-full justify-center"
              disabled={game.active || game.pending}
            >
              <Sparkles aria-hidden="true" size={16} /> {translate("Gợi ý", "Recommend")}
            </button>
          </div>

          {/* Balance Widget */}
          <div className="ww-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[.15em] text-[var(--ww-text-3)]">
                {translate("Điểm cân bằng", "Balance score")}
              </h3>
              <span className="text-xl font-black text-[var(--ww-gold)]">
                {balanceScore}
              </span>
            </div>

            <div className="relative h-2 w-full rounded-full bg-[var(--ww-surface-3)]">
              <div
                className="absolute bottom-0 left-1/2 top-0 w-0.5 bg-[var(--ww-text-3)]"
                style={{ transform: "translateX(-50%)" }}
              />
              <div
                className={`absolute top-0 bottom-0 rounded-full ${
                  balanceScore === 0
                    ? "bg-[var(--ww-success)]"
                    : balanceScore > 0
                    ? "bg-[var(--ww-faction-village)]"
                    : "bg-[var(--ww-crimson)]"
                }`}
                style={{
                  left: balanceScore >= 0 ? "50%" : `${percentage}%`,
                  right: balanceScore >= 0 ? `${100 - percentage}%` : "50%",
                }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[var(--ww-border-strong)] bg-[var(--ww-text)] shadow"
                style={{ left: `calc(${percentage}% - 7px)` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--ww-text-3)] px-1">
              <span>{translate("Sói", "Werewolves")}</span>
              <span className={balanceScore === 0 ? "text-[var(--ww-success)]" : "text-[var(--ww-text-2)]"}>
                {balanceStatus}
              </span>
              <span>{translate("Dân làng", "Village")}</span>
            </div>

            <p className="ww-divider border-t pt-3 text-[10px] leading-relaxed text-[var(--ww-text-3)]">
              {translate("Mục tiêu: tổng gần 0. Nhóm mới nên để +1 đến +3; nhóm đã quen chơi nên để -1 đến -3 cho Sói có lợi thế.", "Target a total near 0. New groups may prefer +1 to +3; experienced groups may use -1 to -3 to favor the Werewolves.")}
            </p>
          </div>

          {/* Selected Roles List (Roster Editor) */}
          <div className="ww-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[.15em] text-[var(--ww-text-3)]">
              {translate("Vai trò đã chọn", "Selected roles")}
            </h3>
            {activeRoles.length === 0 ? (
              <p className="text-sm text-[var(--ww-text-3)]">{translate("Chưa chọn vai trò nào.", "No roles selected yet.")}</p>
            ) : (
              <ul className="space-y-3">
                {activeRoles.map(role => {
                  const qty = game.quantities[role.roleId] ?? 0
                  const char = characters.find(c => c.id === role.roleId)
                  const roleName = char ? (lang === "en" ? char.nameEn || char.name : char.name) : role.name
                  return (
                    <li className="ww-divider flex items-center justify-between gap-2 border-b pb-2 text-sm last:border-0 last:pb-0" key={role.roleId}>
                      <div className="min-w-0 flex items-center gap-2">
                        <RoleArtwork roleId={role.roleId} roleName={roleName} className="h-10 w-10 shrink-0 rounded-lg" />
                        <span className="truncate font-semibold text-[var(--ww-text-2)]">{roleName}</span>
                        <span className="text-xs text-[var(--ww-text-3)]">
                          ({char?.value && char.value > 0 ? `+${char.value}` : char?.value ?? 0})
                        </span>
                      </div>

                      {/* Editor Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => game.updateQuantity(role.roleId, qty - 1)}
                          disabled={game.active || game.pending}
                          className="ww-quantity-button"
                          aria-label={`${translate("Giảm", "Decrease")} ${roleName}`}
                        >
                          <Minus aria-hidden="true" size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-[var(--ww-text)]">
                          {qty}
                          {char?.max ? `/${char.max}` : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => game.updateQuantity(role.roleId, qty + 1)}
                          disabled={game.active || game.pending}
                          className="ww-quantity-button"
                          aria-label={`${translate("Tăng", "Increase")} ${roleName}`}
                        >
                          <Plus aria-hidden="true" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => game.updateQuantity(role.roleId, 0)}
                          disabled={game.active || game.pending}
                          className="ww-delete-button ml-1"
                          aria-label={`${translate("Xóa", "Remove")} ${roleName}`}
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Confirm Button */}
          <div>
            <button
              type="button"
              aria-label={translate("Xác nhận thiết lập", "Confirm setup")}
              disabled={!game.canConfirmRoleSetup || game.pending || game.active}
              onClick={() => void confirm()}
              className="ww-button ww-button-cta ww-button-primary"
            >
              {game.status === "CONFIRM_REQUEST_PENDING" ? translate("Đang xác nhận...", "Confirming...") : translate("Xác nhận", "Confirm")}
            </button>
            <p className={`mt-3 text-center text-xs leading-relaxed ${setupValidation.valid ? "text-[var(--ww-text-3)]" : "ww-text-danger"}`}>
              {game.status === "CONFIRM_REQUEST_PENDING" ? translate("Đang xác nhận thiết lập...", "Confirming setup...") : validationMessage}
            </p>
            {game.statusMessage && (
              <p
                role={game.status === "CONFIRM_ERROR" || game.status === "START_ERROR" || game.status === "END_ERROR" ? "alert" : "status"}
                className="ww-inset-surface mt-3 rounded-xl border border-[var(--ww-border)] px-3 py-2 text-sm text-[var(--ww-text-2)]"
              >
                {game.statusMessage}
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
