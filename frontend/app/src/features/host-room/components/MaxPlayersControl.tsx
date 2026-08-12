import { MIN_MAX_PLAYERS, MAX_MAX_PLAYERS } from "../hooks/useUpdateMaxPlayers"
export type MaxPlayersControlProps = { confirmedMaxPlayers: number; playerCount: number; draft: number; onDraftChange: (value: number) => void; loading: boolean; error: { code: string; message: string } | null; canSubmit: boolean; onSubmit: (customDraft?: number) => void; disabled?: boolean }
const OPTIONS = Array.from({ length: MAX_MAX_PLAYERS - MIN_MAX_PLAYERS + 1 }, (_, index) => MIN_MAX_PLAYERS + index)
export default function MaxPlayersControl({ confirmedMaxPlayers, playerCount, draft, onDraftChange, loading, error, canSubmit, onSubmit, disabled = false }: MaxPlayersControlProps) {
  return <section aria-label="Max players" className="ww-card p-5 sm:p-6">
    <h2 className="ww-display text-xl text-[var(--ww-text)]">Lobby capacity</h2><p className="mt-2 text-sm text-[var(--ww-text-2)]">Confirmed max players: <span data-testid="confirmed-max-players" className="font-bold text-[var(--ww-text)]">{confirmedMaxPlayers}</span></p>
    <label className="mt-5 block text-sm font-bold text-[var(--ww-text-2)]" htmlFor="max-players-select">Max players</label>
    <select id="max-players-select" className="ww-input mt-2 px-3" value={draft} disabled={disabled || loading} onChange={event => onDraftChange(Number(event.target.value))}>{OPTIONS.map(value => <option key={value} value={value} disabled={value < playerCount}>{value}</option>)}</select>
    <button className="ww-button ww-button-cta ww-button-primary mt-3" type="button" onClick={() => onSubmit()} disabled={disabled || !canSubmit || loading}>{loading ? "Đang cập nhật..." : error ? "Thử lại" : "Cập nhật"}</button>
    {disabled && <p className="mt-3 text-xs text-[var(--ww-text-3)]">Capacity is locked while the Room is PLAYING.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-[var(--ww-error)]">{error.message}</p>}
  </section>
}
