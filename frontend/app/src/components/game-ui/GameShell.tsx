import type { ReactNode } from "react"
import { Loader2, Moon, Wifi, WifiOff } from "lucide-react"
import { useLanguage } from "../../contexts/LanguageProvider"

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-11 w-11 rounded-xl" : "h-16 w-16"
  return (
    <span className={`ww-brand-mark ${sizeClass}`} aria-hidden="true">
      <Moon className={size === "lg" ? "h-10 w-10" : size === "sm" ? "h-6 w-6" : "h-8 w-8"} strokeWidth={2.1} />
    </span>
  )
}

export function GameShell({ children, narrow = false, center = false }: { children: ReactNode; narrow?: boolean; center?: boolean }) {
  return (
    <main className="ww-page">
      <div className="ww-fog" aria-hidden="true" />
      <div className={`ww-content-frame ${narrow ? "ww-content-frame--narrow" : ""} ${center ? "ww-content-frame--center" : ""}`}>
        {children}
      </div>
    </main>
  )
}

export function ConnectionBadge({ state }: { state: string }) {
  const { translate } = useLanguage()
  const normalized = state.toLowerCase()
  const connected = normalized === "connected"
  const failed = normalized.includes("failed") || normalized.includes("lost")
  const Icon = connected ? Wifi : failed ? WifiOff : Loader2

  const label = failed ? state : connected ? translate("Đã kết nối", "Connected") : state

  return (
    <span className={`ww-status-pill ${connected ? "ww-status-success" : failed ? "ww-status-error" : "ww-status-warning"}`} role="status" aria-live="polite">
      <Icon aria-hidden="true" size={14} className={!connected && !failed ? "animate-spin motion-reduce:animate-none" : ""} />
      <span>{label}</span>
    </span>
  )
}
