import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import { updateMaxPlayers } from "../api/updateMaxPlayersApi"
import { useCreateRoom } from "../hooks/useCreateRoom"
import { storeHostCredential } from "../storage/hostCredentialStorage"
import type { CreateRoomResponse } from "../types/createRoom"
import CreateRoomView from "../views/CreateRoomView"
import { useLanguage } from "../../../contexts/LanguageProvider"

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const { translate } = useLanguage()
  const { status, error, create } = useCreateRoom()
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null)
  const [capacityError, setCapacityError] = useState<string | null>(null)
  const [capacityPending, setCapacityPending] = useState(false)
  const capacityInFlight = useRef(false)

  async function handleCreateRoom() {
    if (capacityInFlight.current) return
    const room = createdRoom ?? await create()
    if (!room) return
    if (!createdRoom) {
      storeHostCredential(room.roomCode, room.hostId)
      setCreatedRoom(room)
    }
    if (maxPlayers === 6) { navigate(routePaths.hostRoom(room.roomCode)); return }
    capacityInFlight.current = true
    setCapacityPending(true)
    setCapacityError(null)
    try {
      await updateMaxPlayers(room.roomCode, room.hostId, maxPlayers)
      navigate(routePaths.hostRoom(room.roomCode))
    } catch (cause) {
      setCapacityError(cause instanceof Error ? cause.message : translate("Phòng đã được tạo nhưng không thể cập nhật sức chứa.", "The room was created, but its capacity could not be updated."))
    } finally {
      capacityInFlight.current = false
      setCapacityPending(false)
    }
  }

  return <CreateRoomView maxPlayers={maxPlayers} pending={status === "loading" || capacityPending} error={capacityError ?? error} createdRoomCode={createdRoom?.roomCode ?? null} onMaxPlayersChange={setMaxPlayers} onSubmit={() => void handleCreateRoom()} onContinueWithDefault={() => { if (createdRoom) navigate(routePaths.hostRoom(createdRoom.roomCode)) }} onBack={() => navigate(routePaths.home)} />
}
