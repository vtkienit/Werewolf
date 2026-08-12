import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { routePaths } from "../app/routePaths"
import { joinRoom } from "../config/playerJoinApi"
import { canonicalRoomCode, storePlayerSession } from "../config/playerSessionStorage"
import JoinRoomView from "../views/JoinRoomView"
import { useLanguage } from "../contexts/LanguageProvider"

export default function JoinPage() {
  const { roomCode = "" } = useParams()
  const navigate = useNavigate()
  const { translate } = useLanguage()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const code = canonicalRoomCode(roomCode)

  async function submit() {
    if (pending) return
    if (!code) { setError(translate("Nhập mã phòng hợp lệ.", "Enter a valid room code.")); return }
    const playerName = name.trim()
    if (playerName.length < 1 || playerName.length > 30) { setError(translate("Tên người chơi phải có từ 1 đến 30 ký tự.", "Player name must be between 1 and 30 characters.")); return }
    setPending(true)
    setError(null)
    try {
      const joined = await joinRoom(code, playerName)
      if (!storePlayerSession({ roomCode: code, ...joined })) throw new Error(translate("Không thể lưu phiên người chơi.", "Unable to save player session."))
      navigate(routePaths.playerWaiting(code))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("Không thể tham gia phòng.", "Unable to join room."))
    } finally {
      setPending(false)
    }
  }

  return <JoinRoomView roomCode={code ?? roomCode} playerName={name} pending={pending} error={error} onPlayerNameChange={value => { setName(value); setError(null) }} onSubmit={() => void submit()} />
}

