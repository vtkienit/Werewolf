import { ClipboardPen, Home, PlusCircle, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"

const linkClass = "ww-button ww-button-secondary"

type HostNavigationProps = { roomCode: string; gameActive: boolean; hasReview?: boolean }

export default function HostNavigation({ roomCode, gameActive, hasReview = false }: HostNavigationProps) {
  return (
    <nav aria-label="Host room navigation" className="ww-card p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--ww-gold)]">Preparation</p>
      <h2 className="ww-display mt-1 text-xl text-[var(--ww-text)]">Host actions</h2>
      <Link className="ww-button ww-button-cta ww-button-primary mt-4" to={routePaths.hostSetup(roomCode)}><Sparkles aria-hidden="true" size={18} /> Thiết lập vai trò</Link>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {hasReview ? <Link className={linkClass} to={routePaths.hostRoundNote(roomCode)}><ClipboardPen aria-hidden="true" size={18} /> Review previous game</Link> : null}
        {gameActive
          ? <Link className={linkClass} to={routePaths.hostRoundNote(roomCode)}><ClipboardPen aria-hidden="true" size={18} /> Round Note</Link>
          : <span aria-disabled="true" className="ww-button cursor-not-allowed border border-[var(--ww-border)] text-[var(--ww-text-3)]"><ClipboardPen aria-hidden="true" size={18} /> Round Note</span>}
        <Link className={linkClass} to={routePaths.home}><Home aria-hidden="true" size={18} /> Home</Link>
        <Link className={linkClass} to={routePaths.hostCreate}><PlusCircle aria-hidden="true" size={18} /> New room</Link>
      </div>
    </nav>
  )
}
