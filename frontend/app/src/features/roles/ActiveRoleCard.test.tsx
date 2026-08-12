import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import ActiveRoleCard from "./ActiveRoleCard"
import LanguageToggle from "../../components/LanguageToggle"
import { LanguageProvider } from "../../contexts/LanguageProvider"

describe("ActiveRoleCard", () => {
  it("renders public canonical metadata and no setup controls", () => {
    render(<ActiveRoleCard roleId="werewolf" fallbackName="Werewolf" quantity={2} />)
    expect(screen.getByRole("img", { name: "Ma Sói" })).toHaveAttribute("src", "/roles/werewolf.webp")
    expect(screen.getByRole("heading", { name: "Ma Sói" })).toBeInTheDocument()
    expect(screen.getByText("Werewolf")).toBeInTheDocument()
    expect(screen.getByText("Sói")).toBeInTheDocument()
    expect(screen.getByLabelText("Số lượng 2")).toHaveTextContent("×2")
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.queryByRole("spinbutton")).toBeNull()
  })

  it("switches the public role ability to English", async () => {
    render(<LanguageProvider><ActiveRoleCard roleId="werewolf" fallbackName="Werewolf" quantity={2} /><LanguageToggle /></LanguageProvider>)

    await userEvent.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))

    expect(screen.getByText(/Werewolves agree on one player to devour/i)).toBeInTheDocument()
  })
})
