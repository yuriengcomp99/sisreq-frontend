import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/app/lib/auth-session"

/** Base da API sem barra final (evita `//auth/login` quando o env termina com `/`). */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "")
const AUTH_REFRESH_PATH =
  process.env.NEXT_PUBLIC_AUTH_REFRESH_PATH ?? "/auth/refresh"

const AUTH_PUBLIC_PREFIXES = ["/auth/login", "/auth/register", AUTH_REFRESH_PATH]

function isAuthPublicEndpoint(endpoint: string) {
  return AUTH_PUBLIC_PREFIXES.some((p) => endpoint.startsWith(p))
}

function extractAccessTokenFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return
  const root = data as Record<string, unknown>
  const dados = root.dados
  if (dados && typeof dados === "object") {
    const o = dados as Record<string, unknown>
    const t = o.accessToken ?? o.access_token
    if (typeof t === "string" && t) return t
  }
  const top = root.accessToken ?? root.access_token
  if (typeof top === "string" && top) return top
  return
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}${AUTH_REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      const raw = await res.text()
      if (!res.ok) return false
      if (raw) {
        try {
          const data = JSON.parse(raw) as unknown
          const token = extractAccessTokenFromBody(data)
          if (token) setAccessToken(token)
        } catch {
          // resposta sem JSON ou sem accessToken — refresh só renovou cookie
        }
      }
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

export type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { skipAuthRefresh, ...fetchOptions } = options
  const isFormData = fetchOptions.body instanceof FormData

  const token = getAccessToken()
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  }

  const url = `${API_URL}${endpoint}`

  async function request(): Promise<Response> {
    return fetch(url, {
      ...fetchOptions,
      credentials: fetchOptions.credentials ?? "include",
      headers,
    })
  }

  let res = await request()

  if (
    res.status === 401 &&
    !skipAuthRefresh &&
    !isAuthPublicEndpoint(endpoint) &&
    !endpoint.startsWith("/auth/logout")
  ) {
    const refreshed = await refreshSession()
    if (refreshed) {
      res = await request()
    } else {
      clearAccessToken()
    }
  }

  const raw = await res.text()
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  const data = isJson && raw ? JSON.parse(raw) : raw

  if (!res.ok) {
    const message =
      (isJson && typeof data === "object" && data
        ? (
            (data as Record<string, unknown>).mensagem ??
            (data as Record<string, unknown>).message ??
            (data as Record<string, unknown>).error
          )
        : null) || `Erro na requisição (${res.status})`

    throw new Error(String(message))
  }

  return data as T
}

/** Parses `filename` from `Content-Disposition` (RFC 5987 `filename*` or `filename`). */
function filenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return
  const star = /filename\*\s*=\s*([^']*)''([^;]+)/i.exec(header)
  if (star?.[2]) {
    try {
      return decodeURIComponent(star[2].trim())
    } catch {
      return star[2].trim()
    }
  }
  const quoted = /filename\s*=\s*"([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1].trim()
  const plain = /filename\s*=\s*([^;\s]+)/i.exec(header)
  if (plain?.[1]) return plain[1].trim().replace(/^"|"$/g, "")
  return
}

export type ApiBinaryResult = {
  blob: Blob
  filename?: string
}

/**
 * Binary GET/POST (PDF, DOCX, etc.) with the same auth/refresh flow as `apiFetch`.
 * On error, tries to read a message from JSON in the response body.
 */
export async function apiFetchBinary(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<ApiBinaryResult> {
  const { skipAuthRefresh, ...fetchOptions } = options
  const isFormData = fetchOptions.body instanceof FormData

  const token = getAccessToken()
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  }

  const url = `${API_URL}${endpoint}`

  async function request(): Promise<Response> {
    return fetch(url, {
      ...fetchOptions,
      credentials: fetchOptions.credentials ?? "include",
      headers,
    })
  }

  let res = await request()

  if (
    res.status === 401 &&
    !skipAuthRefresh &&
    !isAuthPublicEndpoint(endpoint) &&
    !endpoint.startsWith("/auth/logout")
  ) {
    const refreshed = await refreshSession()
    if (refreshed) {
      res = await request()
    } else {
      clearAccessToken()
    }
  }

  if (!res.ok) {
    const raw = await res.text()
    const contentType = res.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")
    let message = `Request failed (${res.status})`
    if (isJson && raw) {
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        const m = data.mensagem ?? data.message ?? data.error
        if (typeof m === "string" && m) message = m
      } catch {
        // ignore
      }
    } else if (raw && raw.length < 500) {
      message = raw
    }
    throw new Error(message)
  }

  const blob = await res.blob()
  const filename = filenameFromContentDisposition(res.headers.get("content-disposition"))
  return { blob, filename }
}
