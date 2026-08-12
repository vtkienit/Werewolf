import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import { canonicalRoomCode } from "../../../config/playerSessionStorage"
import HomeView from "../views/HomeView"
import HowToPlayPage from "./HowToPlayPage"
import { useLanguage } from "../../../contexts/LanguageProvider"

export default function HomePage() {
  const navigate = useNavigate()
  const { translate } = useLanguage()
  const location = useLocation()
  const [roomCode, setRoomCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  function joinRoom() {
    const code = canonicalRoomCode(roomCode)
    if (!code) { setError(translate("Nhập mã phòng hợp lệ gồm 6 ký tự.", "Enter a valid 6-character room code.")); return }
    navigate(routePaths.joinRoom(code))
  }

  if (location.hash === "#how-to-play") return <HowToPlayPage />
  return <HomeView roomCode={roomCode} error={error} onRoomCodeChange={value => { setRoomCode(value.toUpperCase()); setError(null) }} onJoin={joinRoom} />
}
