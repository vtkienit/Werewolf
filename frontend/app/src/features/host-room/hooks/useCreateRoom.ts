import { useCallback, useRef, useState } from "react"
import { createRoom } from "../api/createRoomApi"
import type { CreateRoomResponse } from "../types/createRoom"

type CreateRoomStatus = "idle" | "loading" | "error" | "success"
type CreateRoomRequest = () => Promise<CreateRoomResponse>

export function useCreateRoom(request: CreateRoomRequest = createRoom) {
  const [status, setStatus] = useState<CreateRoomStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const create = useCallback(async (): Promise<CreateRoomResponse | undefined> => {
    if (inFlight.current) return undefined
    inFlight.current = true
    setStatus("loading")
    setError(null)
    try {
      const response = await request()
      setStatus("success")
      return response
    } catch (cause) {
      setStatus("error")
      setError(cause instanceof Error ? cause.message : "Unable to create room")
      return undefined
    } finally { inFlight.current = false }
  }, [request])
  return { status, error, create }
}
