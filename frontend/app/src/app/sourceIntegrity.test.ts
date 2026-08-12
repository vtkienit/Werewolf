import { describe, expect, it } from "vitest"

const modules = import.meta.glob("../**/*.{ts,tsx}", { eager: true, query: "?raw", import: "default" }) as Record<string, string>
const sources = Object.entries(modules)
  .filter(([path]) => !path.includes(".test."))
  .map(([path, content]) => ({ path, content }))

describe("production source integrity", () => {
  it("owns exactly one production BrowserRouter in app/routes.tsx", () => {
    const owners = sources.filter(source => source.content.includes("BrowserRouter"))
    expect(owners.map(source => source.path)).toEqual([expect.stringMatching(/routes\.tsx$/)])
    expect((owners[0].content.match(/<BrowserRouter/g) ?? [])).toHaveLength(1)
    expect(sources.some(source => /HashRouter|MemoryRouter|RouterProvider|createBrowserRouter/.test(source.content))).toBe(false)
  })

  it("does not route the legacy chat Home page or import from the Figma reference", () => {
    const router = sources.find(source => source.path.endsWith("/routes.tsx"))!.content
    expect(router).not.toMatch(/pages\/Home["']/)
    expect(router).not.toMatch(/path=["']\/(?:home|create-room|join-room|rooms\/)/)
    expect(sources.some(source => source.content.includes("figma-reference"))).toBe(false)
  })

  it("does not hardcode screenshot Room codes", () => {
    const production = sources.map(source => source.content).join("\n")
    const screenshotCodes = [["PM4", "WKS"], ["3NN", "M4G"], ["AAA", "AAA"], ["ADA", "SD"]]
      .map(parts => parts.join(""))
    expect(screenshotCodes.some(code => production.includes(code))).toBe(false)
  })
})
