import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { afterEach, describe, expect, it } from "vitest"
import HomePage from "./HomePage"
import { LanguageProvider } from "../../../contexts/LanguageProvider"
import LanguageToggle from "../../../components/LanguageToggle"

function Location() {
  return <output>{useLocation().pathname}</output>
}

afterEach(cleanup)

describe("HomePage", () => {
  it("renders the integrated landing actions and navigates to the create route", async () => {
    render(<MemoryRouter><Routes><Route path="*" element={<><HomePage /><Location /></>} /></Routes></MemoryRouter>)
    expect(screen.getByRole("complementary", { name: /Midnight Phantasm/i })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Midnight Phantasm/i })).toHaveAttribute("src", "/midnight-cards.png")
    expect(screen.getByRole("heading", { name: /Ma Sói Online/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("link", { name: /Tạo phòng mới/i }))
    expect(screen.getByText("/host/create")).toBeInTheDocument()
    expect(screen.getByRole("form", { name: /Tham gia phòng/i })).toBeInTheDocument()
  })

  it("normalizes a valid Room code into the locked Player Join route", async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Routes><Route path="*" element={<><HomePage /><Location /></>} /></Routes></MemoryRouter>)
    await user.type(screen.getByLabelText("Mã phòng"), " a7k9q2 ")
    await user.click(screen.getByRole("button", { name: /Tham gia phòng/i }))
    expect(screen.getByText("/join/A7K9Q2")).toBeInTheDocument()
  })

  it("switches the Home body from Vietnamese to English", async () => {
    render(<LanguageProvider><MemoryRouter><HomePage /><LanguageToggle /></MemoryRouter></LanguageProvider>)
    expect(screen.getByRole("heading", { name: /Đêm nay.*Ai sẽ là kẻ bị săn/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Chuyển sang Tiếng Anh" }))
    expect(screen.getByRole("heading", { name: /Tonight.*who will be hunted/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Create a new room" })).toBeInTheDocument()
  })
})
