import { useCallback, useEffect, useRef, useState } from "react"

export type ClipboardFeedbackStatus = "idle" | "success" | "error"

const SUCCESS_MESSAGE = "Đã sao chép"
const ERROR_MESSAGE = "Không thể sao chép. Hãy chọn và sao chép nội dung thủ công."
const FEEDBACK_DURATION_MS = 2000

export function useClipboardFeedback() {
  const [status, setStatus] = useState<ClipboardFeedbackStatus>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const latestRequestId = useRef(0)

  const clearResetTimer = useCallback(() => {
    if (resetTimer.current !== null) {
      clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      latestRequestId.current += 1
      clearResetTimer()
    }
  }, [clearResetTimer])

  const copy = useCallback(async (value: string) => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    clearResetTimer()
    try {
      if (typeof navigator === "undefined" || navigator.clipboard?.writeText === undefined) {
        throw new Error("Clipboard unavailable")
      }
      await navigator.clipboard.writeText(value)
      if (!mounted.current || requestId !== latestRequestId.current) return
      setStatus("success")
      setMessage(SUCCESS_MESSAGE)
      resetTimer.current = setTimeout(() => {
        if (!mounted.current || requestId !== latestRequestId.current) return
        setStatus("idle")
        setMessage(null)
        resetTimer.current = null
      }, FEEDBACK_DURATION_MS)
    } catch {
      if (!mounted.current || requestId !== latestRequestId.current) return
      setStatus("error")
      setMessage(ERROR_MESSAGE)
    }
  }, [clearResetTimer])

  return { status, message, copy }
}
