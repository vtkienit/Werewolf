import { describe, expect, it } from "vitest"

type NodeProcess = { getBuiltinModule: (name: "fs") => { readFileSync: (path: string, encoding: "utf8") => string } }
const nodeProcess = (globalThis as typeof globalThis & { process: NodeProcess }).process
const css = nodeProcess.getBuiltinModule("fs").readFileSync("src/styles/werewolf.css", "utf8")
const components = import.meta.glob([
  "../components/room/RoomInformationPanel.tsx",
  "../features/host-room/components/HostRoomShell.tsx",
  "../features/game-setup/components/RoleQuantityControl.tsx",
  "../features/roles/ActiveRoleCard.tsx",
  "../pages/PlayerWaitingPage.tsx",
  "../pages/PlayerCardPage.tsx",
], { eager: true, query: "?raw", import: "default" }) as Record<string, string>

function contrast(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const values = hex.match(/[a-f\d]{2}/gi)!.map(value => Number.parseInt(value, 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    return .2126 * values[0] + .7152 * values[1] + .0722 * values[2]
  }
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (light + .05) / (dark + .05)
}

describe("Midnight Phantasm theme system", () => {
  it("defines the required Midnight and Daylight semantic tokens", () => {
    expect(css).toContain("--background: #10131a")
    expect(css).toContain("--surface: rgb(31 41 65 / 78%)")
    expect(css).toContain("--text-secondary: #d1d5db")
    expect(css).toContain("--background: #f8fafc")
    expect(css).toContain("--surface: #ffffff")
    expect(css).toContain("--text-secondary: #475569")
    expect(css).toContain('url("/midnight_light_mode.png")')
  })

  it("maps cards, text, header, Ready, Review, and inputs to shared theme variables", () => {
    expect(css).toMatch(/\.ww-card \{[^}]*var\(--ww-card-bg\)/s)
    expect(css).toMatch(/\.ww-global-header \{[^}]*var\(--ww-header-bg\)/s)
    expect(css).toMatch(/\.ww-ready-control \{[^}]*var\(--ww-ready-bg\)/s)
    expect(css).toMatch(/\.ww-review-action \{[^}]*var\(--ww-surface-2\)/s)
    expect(css).toMatch(/\.ww-input \{[^}]*var\(--ww-input-bg\)/s)
    expect(css).toContain("--ww-button-height-cta:3.25rem")
    expect(css).toContain("--ww-button-height-standard:3rem")
    expect(css).toContain("--ww-button-height-compact:2.25rem")
    expect(css).toContain("--ww-button-height-icon:2.75rem")
    expect(css).toMatch(/\.ww-ready-control \{[^}]*var\(--ww-button-height-cta\)/s)
    expect(css).toMatch(/\.ww-review-action \{[^}]*var\(--ww-button-height-cta\)/s)
  })

  it("keeps Room panels and role cards on coordinated semantic surfaces", () => {
    const source = Object.values(components).join("\n")
    expect(source).toContain("ww-room-players-panel")
    expect(source).toContain("ww-room-information")
    expect(source).toContain("ww-role-setup-card")
    expect(source).toContain("ww-active-role-card")
    expect(source).toContain("ww-private-role-card")
    expect(css).toContain(".ww-room-dashboard > .ww-room-players-panel { grid-area:auto; width:100%; }")
    expect(css).toContain(".ww-room-sidebar .ww-room-information { grid-area:auto; width:100%; height:auto; }")
  })

  it("keeps primary and secondary text above WCAG AA contrast in both themes", () => {
    expect(contrast("#ffffff", "#10131a")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#d1d5db", "#10131a")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#0f172a", "#f8fafc")).toBeGreaterThanOrEqual(4.5)
    expect(contrast("#475569", "#f8fafc")).toBeGreaterThanOrEqual(4.5)
  })
})
