function requiredEnvironmentValue(
  name: "VITE_API_URL" | "VITE_WS_URL",
  value: string | undefined,
): string {
  const normalized = value?.trim().replace(/\/+$/, "")

  if (!normalized) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return normalized
}

export const environment = Object.freeze({
  apiUrl: requiredEnvironmentValue(
    "VITE_API_URL",
    import.meta.env.VITE_API_URL,
  ),
  webSocketUrl: requiredEnvironmentValue(
    "VITE_WS_URL",
    import.meta.env.VITE_WS_URL,
  ),
})
