let accessToken: string | null = null

export function setAccessToken(token: string | null | undefined) {
  if (token == null || token === "") {
    accessToken = null
    return
  }
  accessToken = token.replace(/^Bearer\s+/i, "").trim()
}

export function getAccessToken(): string | null {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}
