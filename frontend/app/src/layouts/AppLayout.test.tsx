import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import AppLayout from "./AppLayout"
import HowToPlayPage from "../features/host-room/pages/HowToPlayPage"
import { THEME_STORAGE_KEY, ThemeProvider } from "../contexts/ThemeProvider"
import { LanguageProvider } from "../contexts/LanguageProvider"

function OriginProbe() {
  const location = useLocation()
  return <h1>{`${location.pathname}${location.search}${location.hash}`}</h1>
}

function RootProbe() {
  return useLocation().hash === "#how-to-play" ? <HowToPlayPage /> : <OriginProbe />
}

function renderAt(origin: string) {
  return render(
    <LanguageProvider><ThemeProvider>
      <MemoryRouter initialEntries={[origin]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootProbe />} />
            <Route path="/host/create" element={<OriginProbe />} />
            <Route path="/host/rooms/:roomCode" element={<OriginProbe />} />
            <Route path="/host/rooms/:roomCode/setup" element={<OriginProbe />} />
            <Route path="/host/rooms/:roomCode/round-note" element={<OriginProbe />} />
            <Route path="/player/:roomCode" element={<OriginProbe />} />
            <Route path="/player/:roomCode/card" element={<OriginProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider></LanguageProvider>,
  )
}

describe("AppLayout Room-aware navigation", () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); document.documentElement.removeAttribute("data-theme") })
  afterEach(() => { cleanup(); localStorage.clear(); document.documentElement.removeAttribute("data-theme") })

  it.each([
    "/player/A7K9Q2",
    "/player/A7K9Q2/card?view=compact#role",
    "/host/rooms/A7K9Q2",
    "/host/rooms/A7K9Q2/setup?panel=roles",
    "/host/rooms/A7K9Q2/round-note#round-2",
  ])("returns from How to play to the exact origin %s", async origin => {
    const user = userEvent.setup()
    renderAt(origin)
    await user.click(screen.getByRole("link", { name: "Cách chơi" }))
    sessionStorage.setItem("player-room-credential", "preserved")
    expect(screen.getByRole("heading", { name: "Cách chơi" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Ma Sói Online" })).toBeNull()
    await user.click(screen.getByRole("button", { name: "Quay lại" }))
    expect(screen.getByRole("heading", { name: origin })).toBeInTheDocument()
    expect(sessionStorage.getItem("player-room-credential")).toBe("preserved")
  })

  it("keeps Room branding non-interactive and groups How to play before the theme toggle", () => {
    renderAt("/player/A7K9Q2")
    const brand = document.querySelector(".ww-global-header__brand") as HTMLElement
    const guide = screen.getByRole("link", { name: "Cách chơi" })
    const theme = screen.getByRole("button", { name: /Chuyển sang giao diện/ })
    expect(brand.tagName).toBe("SPAN")
    expect(brand).not.toHaveAttribute("tabindex")
    expect(guide.parentElement).toHaveClass("ww-global-header__actions")
    expect(guide.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("allows non-Room branding to return Home", () => {
    renderAt("/host/create")
    expect(screen.getByRole("link", { name: "Ma Sói Online" })).toHaveAttribute("href", "/")
  })

  it("uses the scoped session fallback after a How-to-Play refresh", async () => {
    const user = userEvent.setup()
    sessionStorage.setItem("werewolf-how-to-play-origin", "/player/A7K9Q2/card")
    renderAt("/#how-to-play")
    await user.click(screen.getByRole("button", { name: "Quay lại" }))
    expect(screen.getByRole("heading", { name: "/player/A7K9Q2/card" })).toBeInTheDocument()
  })

  it("falls back safely to Home on direct How-to-Play access", async () => {
    const user = userEvent.setup()
    renderAt("/#how-to-play")
    await user.click(screen.getByRole("button", { name: "Quay lại" }))
    expect(screen.getByRole("heading", { name: "/" })).toBeInTheDocument()
  })

  it("preserves the explicit theme while opening and returning from How to play", async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    const view = renderAt("/player/A7K9Q2")
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    expect(view.container.querySelector(".lucide-moon")).toBeInTheDocument()
    expect(view.container.textContent).not.toMatch(/[☀🌙]/u)
    await user.click(screen.getByRole("link", { name: "Cách chơi" }))
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    await user.click(screen.getByRole("button", { name: "Quay lại" }))
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })

  it("renders the shared footer on Room routes and switches from Vietnamese to English", async () => {
    const user = userEvent.setup()
    renderAt("/player/A7K9Q2")
    const footer = screen.getByRole("contentinfo")
    expect(footer).toHaveTextContent("Điều khoản")
    expect(footer).toHaveTextContent("Chính sách bảo mật")
    expect(footer).toHaveTextContent("Liên hệ")
    expect(document.documentElement).toHaveAttribute("lang", "vi")
    await user.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))
    expect(screen.getByRole("link", { name: "How to play" })).toBeInTheDocument()
    expect(footer).toHaveTextContent("Privacy policy")
    await user.click(screen.getByRole("link", { name: "How to play" }))
    expect(screen.getByRole("heading", { name: "How to play" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Create or join a room" })).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute("lang", "en")
    expect(localStorage.getItem("lang")).toBe("en")
  })
})
