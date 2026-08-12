import { useCallback, useEffect, useRef, useState } from "react"
import { updateMaxPlayers } from "../api/updateMaxPlayersApi"
import type { UpdateMaxPlayersResponse } from "../types/updateMaxPlayers"
import type { UpdateMaxPlayersLocalError } from "../types/updateMaxPlayers"

export type UpdateMaxPlayersStatus = "idle" | "loading" | "error" | "success"
type UpdateMaxPlayersRequest = (roomCode: string, hostId: string, maxPlayers: number) => Promise<UpdateMaxPlayersResponse>

export const MIN_MAX_PLAYERS = 6
export const MAX_MAX_PLAYERS = 12
export const HOST_CREDENTIAL_UNAVAILABLE_MESSAGE = "Host credential is unavailable"

type UseUpdateMaxPlayersOptions = {
  confirmedMaxPlayers: number
  playerCount: number
  roomCode: string
  hostId: string | null
  request?: UpdateMaxPlayersRequest
}
export function useUpdateMaxPlayers({
  confirmedMaxPlayers,
  playerCount,
  roomCode,
  hostId,
  request = updateMaxPlayers,
}: UseUpdateMaxPlayersOptions) {
  const [confirmed, setConfirmed] = useState(confirmedMaxPlayers)
  const [draft, setDraft] = useState(confirmedMaxPlayers)
  const [status, setStatus] = useState<UpdateMaxPlayersStatus>("idle")
  const [error, setError] = useState<UpdateMaxPlayersLocalError | null>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!inFlight.current) {
      setConfirmed(confirmedMaxPlayers)
      setDraft(confirmedMaxPlayers)
    }
  }, [confirmedMaxPlayers])

  const canSubmit =
    hostId !== null
    && draft >= MIN_MAX_PLAYERS
    && draft <= MAX_MAX_PLAYERS
    && draft >= playerCount
    && draft !== confirmed

  const submit = useCallback(async (customDraft?: number): Promise<UpdateMaxPlayersResponse | undefined> => {
    if (inFlight.current) {
      return undefined
    }
    if (hostId === null) {
      setStatus("error")
      setError({ code: "HOST_CREDENTIAL_MISSING", message: HOST_CREDENTIAL_UNAVAILABLE_MESSAGE })
      return undefined
    }
    const targetDraft = customDraft !== undefined ? customDraft : draft
    inFlight.current = true
    setStatus("loading")
    setError(null)
    try {
      const response = await request(roomCode, hostId, targetDraft)
      setConfirmed(response.maxPlayers)
      setDraft(response.maxPlayers)
      setStatus("success")
      return response
    } catch (cause) {
      setStatus("error")
      setError({
        code: typeof cause === "object" && cause !== null && "code" in cause && typeof cause.code === "string" ? cause.code : "UPDATE_FAILED",
        message: cause instanceof Error ? cause.message : "Unable to update max players",
      })
      return undefined
    } finally {
      inFlight.current = false
    }
  }, [hostId, roomCode, draft, request])

  return { confirmed, draft, setDraft, status, error, canSubmit, submit }
}
