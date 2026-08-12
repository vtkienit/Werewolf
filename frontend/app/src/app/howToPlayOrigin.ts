import type { Location } from "react-router-dom"

export const HOW_TO_PLAY_ORIGIN_KEY = "werewolf-how-to-play-origin"

export type HowToPlayLocationState = Readonly<{ howToPlayOrigin?: string }>

export function validateHowToPlayOrigin(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  try {
    const url = new URL(value, "https://werewolf.local")
    if (url.origin !== "https://werewolf.local" || `${url.pathname}${url.search}${url.hash}` !== value) return null
    if (url.pathname === "/" && url.hash === "#how-to-play") return null
    return value
  } catch {
    return null
  }
}

export function locationOrigin(location: Pick<Location, "pathname" | "search" | "hash">) {
  return `${location.pathname}${location.search}${location.hash}`
}

export function stateOrigin(state: unknown) {
  return validateHowToPlayOrigin((state as HowToPlayLocationState | null)?.howToPlayOrigin)
}

export function storeHowToPlayOrigin(origin: string) {
  const valid = validateHowToPlayOrigin(origin)
  if (!valid) return
  try { sessionStorage.setItem(HOW_TO_PLAY_ORIGIN_KEY, valid) } catch { /* sessionStorage is an optional refresh fallback. */ }
}

export function loadHowToPlayOrigin() {
  try { return validateHowToPlayOrigin(sessionStorage.getItem(HOW_TO_PLAY_ORIGIN_KEY)) } catch { return null }
}

export function clearHowToPlayOrigin() {
  try { sessionStorage.removeItem(HOW_TO_PLAY_ORIGIN_KEY) } catch { /* No cleanup is required when storage is unavailable. */ }
}

export function isActiveRoomPath(pathname: string) {
  return /^\/host\/rooms\/[^/]+(?:\/(?:setup|round-note))?$/.test(pathname)
    || /^\/player\/[^/]+(?:\/card)?$/.test(pathname)
}

export function isActiveRoomOrigin(origin: string | null) {
  if (!origin) return false
  return isActiveRoomPath(new URL(origin, "https://werewolf.local").pathname)
}
