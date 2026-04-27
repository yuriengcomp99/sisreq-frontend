import { getAccessToken } from "@/app/lib/auth-session"

const DEFAULT_WS_URL = "ws://localhost:8081"

function gatewayBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_WS_GATEWAY_URL?.trim() || DEFAULT_WS_URL
  return raw.replace(/\/$/, "")
}

/** URL usada pelo browser: `ws(s)://host?token=…` */
export function getNotificationsWebSocketUrl(accessToken: string): string {
  return `${gatewayBaseUrl()}?token=${encodeURIComponent(accessToken)}`
}

type WsInbound =
  | { type: "connected"; userId?: string; message?: string }
  | { type: "notifications_unread_count"; count: number }
  | { type: string }

function parseInbound(raw: string): WsInbound | null {
  try {
    const o = JSON.parse(raw) as Record<string, unknown>
    if (!o || typeof o.type !== "string") return null
    return o as WsInbound
  } catch {
    return null
  }
}

export type NotificationsWebSocketCallbacks = {
  onUnreadCount?: (count: number) => void
  onConnected?: (payload: { userId?: string; message?: string }) => void
}

/**
 * Mantém um WebSocket ao gateway (`NEXT_PUBLIC_WS_GATEWAY_URL`, default ws://localhost:8081).
 * Atualiza o contador com mensagens `{ "type":"notifications_unread_count","count":n }`.
 */
export function subscribeNotificationsWebSocket(
  getToken: () => string | null,
  callbacks: NotificationsWebSocketCallbacks
): () => void {
  let disposed = false
  let socket: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  let attempt = 0

  const MIN_MS = 2000
  const MAX_MS = 30_000

  function clearReconnect() {
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }
  }

  function scheduleReconnect() {
    if (disposed) return
    clearReconnect()
    if (!getToken()) return
    const delay = Math.min(MAX_MS, MIN_MS * 2 ** Math.min(attempt, 8))
    attempt += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined
      connect()
    }, delay)
  }

  function connect() {
    if (disposed) return
    clearReconnect()

    const token = getToken()
    if (!token) {
      return
    }

    const url = getNotificationsWebSocketUrl(token)
    socket?.close()
    const ws = new WebSocket(url)
    socket = ws

    ws.onopen = () => {
      attempt = 0
    }

    ws.onmessage = (event) => {
      const msg = parseInbound(String(event.data))
      if (!msg) return
      if (msg.type === "notifications_unread_count") {
        const c = (msg as { count?: unknown }).count
        const n = typeof c === "number" ? c : Number(c)
        if (Number.isFinite(n) && n >= 0) {
          attempt = 0
          callbacks.onUnreadCount?.(Math.floor(n))
        }
      }
      if (msg.type === "connected") {
        const m = msg as { userId?: string; message?: string }
        callbacks.onConnected?.({
          userId: m.userId,
          message: m.message,
        })
      }
    }

    ws.onerror = () => {
      ws.close()
    }

    ws.onclose = () => {
      if (socket === ws) socket = null
      if (!disposed) scheduleReconnect()
    }
  }

  connect()

  return () => {
    disposed = true
    clearReconnect()
    socket?.close()
    socket = null
  }
}

/** Conveniência: usa o access token em memória (mesmo da API). */
export function subscribeNotificationsWebSocketWithSession(
  callbacks: NotificationsWebSocketCallbacks
): () => void {
  return subscribeNotificationsWebSocket(getAccessToken, callbacks)
}
