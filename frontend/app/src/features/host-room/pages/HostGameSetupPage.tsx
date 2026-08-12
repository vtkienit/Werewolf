import { useNavigate } from "react-router-dom"
import { routePaths } from "../../../app/routePaths"
import { GameSetupPanel } from "../../game-setup"
import { useHostRoomRoute } from "./HostRoomPage"

export default function HostGameSetupPage() {
  const navigate = useNavigate()
  const { roomCode, players, roles, game } = useHostRoomRoute()
  return <GameSetupPanel roomCode={roomCode} players={players} roles={roles} game={game} onStarted={() => navigate(routePaths.hostRoom(roomCode))} onEnded={() => navigate(routePaths.hostRoom(roomCode))} />
}
