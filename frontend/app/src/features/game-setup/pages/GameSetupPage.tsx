import { useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { characters } from "../../../data/characters"
import GameSetupPanel from "../components/GameSetupPanel"
import { useHostGame } from "../hooks/useHostGame"
import type { GameSetupPlayer, GameSetupRole } from "../types/gameSetup.types"

function createMockPlayers(playerCount: number): GameSetupPlayer[] {
  return Array.from({ length: playerCount }, (_, index) => ({ playerId: `player-${index + 1}`, playerName: `Player ${index + 1}` }))
}

export default function GameSetupPage() {
  const { roomCode = "DEMO" } = useParams()
  const [searchParams] = useSearchParams()
  const playerCount = Math.max(Number(searchParams.get("players") ?? 8), 1)
  const hostId = searchParams.get("hostId") ?? "host-demo"
  const roles = useMemo<GameSetupRole[]>(() => characters.map(character => ({ roleId: character.id, name: character.nameEn || character.name, team: character.team, maxQuantity: character.max ?? 1 })), [])
  const players = useMemo(() => createMockPlayers(playerCount), [playerCount])
  const game = useHostGame(roomCode, hostId, players, roles)
  return <main className="min-h-screen bg-bg-subtle"><GameSetupPanel roomCode={roomCode} players={players} roles={roles} game={game} /></main>
}
