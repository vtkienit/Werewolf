import type { ButtonHTMLAttributes, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export function GameCard({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: "crimson" | "gold" }) {
  return <div className={`ww-card ${glow === "crimson" ? "ww-card-crimson" : glow === "gold" ? "ww-card-gold" : ""} ${className}`}>{children}</div>
}

export function GameButton({ icon: Icon, children, variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon; variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button {...props} className={`ww-button ww-button-${variant} ${className}`}>
      {Icon && <Icon aria-hidden="true" size={19} />}
      {children}
    </button>
  )
}

export function StatusBadge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "gold" | "crimson" | "success" }) {
  return <span className={`ww-badge ww-badge-${tone}`}>{children}</span>
}
