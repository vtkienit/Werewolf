import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import ThemeToggle from "../components/ThemeToggle"
import { THEME_STORAGE_KEY, ThemeProvider } from "./ThemeProvider"

afterEach(() => { cleanup(); localStorage.clear(); document.documentElement.removeAttribute("data-theme") })

describe("ThemeProvider", () => {
  it("toggles the complete document theme and persists the project key", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    const toggle = screen.getByRole("button", { name: "Chuyển sang giao diện tối" })
    await userEvent.click(toggle)
    expect(document.documentElement).toHaveAttribute("data-theme", "dark")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
    expect(screen.getByRole("button", { name: "Chuyển sang giao diện sáng" })).toBeInTheDocument()
  })

  it("restores an explicit saved theme on a fresh provider mount", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    const first = render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    first.unmount()
    document.documentElement.dataset.theme = "dark"
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })

  it("renders shared Lucide sun and moon icons without emoji", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light")
    const view = render(<ThemeProvider><ThemeToggle /></ThemeProvider>)
    expect(view.container.querySelector(".lucide-moon")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Chuyển sang giao diện tối" }))
    expect(view.container.querySelector(".lucide-sun")).toBeInTheDocument()
    expect(view.container.textContent).not.toMatch(/[☀🌙]/u)
  })
})
