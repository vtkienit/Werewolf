import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { getRoleImageUrl, RoleArtwork } from "./roleArtwork"

describe("role artwork", () => {
  it("resolves canonical production URLs without localized-name derivation", () => {
    expect(getRoleImageUrl("werewolf")).toBe("/roles/werewolf.webp")
    expect(getRoleImageUrl("seer")).toBe("/roles/seer.webp")
    expect(getRoleImageUrl("Ma Sói")).toBeNull()
  })

  it("replaces missing or broken artwork with a safe named fallback", () => {
    const first = render(<RoleArtwork roleId="rusty_knight" roleName="Hiệp sĩ Kiếm Rỉ" />)
    expect(screen.getByRole("img", { name: "Hiệp sĩ Kiếm Rỉ artwork unavailable" })).toHaveTextContent("H")
    first.unmount()

    render(<RoleArtwork roleId="werewolf" roleName="Ma Sói" />)
    fireEvent.error(screen.getByRole("img", { name: "Ma Sói" }))
    expect(screen.getByRole("img", { name: "Ma Sói artwork unavailable" })).toHaveTextContent("M")
  })
})
