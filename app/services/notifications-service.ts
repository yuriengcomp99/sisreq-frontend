import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

/** Corpo de `dados` em respostas de contagem de notificações. */
export interface NotificationsCountDados {
  count: number
}

/** Item normalizado para a UI (texto sempre em `message`). */
export interface NotificationItem {
  id: string | number
  message: string
  read?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Formato de cada elemento em `dados` na listagem (GET). */
export interface NotificationApiRow {
  id: string
  message: string
  read: boolean
  createdAt?: string
  updatedAt?: string
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x)
}

function pickId(o: Record<string, unknown>): string | number | null {
  const keys = ["id", "_id", "uuid", "notificationId", "notification_id"]
  for (const k of keys) {
    const v = o[k]
    if (typeof v === "string" || typeof v === "number") return v
  }
  return null
}

function pickRead(o: Record<string, unknown>): boolean | undefined {
  const v = o.read ?? o.isRead ?? o.is_read ?? o.lida
  if (typeof v === "boolean") return v
  if (v === 0 || v === 1) return v === 1
  return undefined
}

function pickMessage(o: Record<string, unknown>): string {
  const keys = [
    "message",
    "mensagem",
    "text",
    "texto",
    "body",
    "conteudo",
    "conteúdo",
    "description",
    "descricao",
    "descrição",
    "titulo",
    "título",
    "title",
  ]
  for (const k of keys) {
    const v = o[k]
    if (typeof v === "string" && v.trim()) return v.trim()
    if (typeof v === "number" && Number.isFinite(v)) return String(v)
  }
  return ""
}

/** Extrai um array de objetos cru a partir de `dados` (vários formatos de API). */
function unwrapNotificationRows(dados: unknown): unknown[] {
  if (Array.isArray(dados)) return dados
  if (!isRecord(dados)) return []

  for (const key of [
    "notifications",
    "items",
    "data",
    "list",
    "rows",
    "resultado",
    "records",
  ]) {
    const v = dados[key]
    if (Array.isArray(v)) return v
  }
  return []
}

/**
 * Converte o payload da API em itens usados na UI.
 * Aceita `message`, `mensagem`, etc., e vários invólucros em `dados`.
 */
export function mapDadosToNotificationItems(dados: unknown): NotificationItem[] {
  const rows = unwrapNotificationRows(dados)
  const out: NotificationItem[] = []
  for (const x of rows) {
    if (!isRecord(x)) continue
    const id = pickId(x)
    if (id == null) continue
    const message = pickMessage(x) || "Sem mensagem"
    const read = pickRead(x)
    const createdAt =
      typeof x.createdAt === "string" ? x.createdAt : undefined
    const updatedAt =
      typeof x.updatedAt === "string" ? x.updatedAt : undefined
    out.push({ id, message, read, createdAt, updatedAt })
  }
  return out
}

/** GET /notifications/unread-count — notificações com `read = false`. */
export async function getUnreadNotificationCount() {
  return apiFetch<ApiResponse<NotificationsCountDados>>(
    "/notifications/unread-count",
    { method: "GET" }
  )
}

/**
 * Lista notificações não lidas.
 * Tenta `GET /notifications/unread`; se falhar (ex. 404), tenta `GET /notifications` e filtra `read !== true`.
 */
export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  try {
    const res = await apiFetch<ApiResponse<NotificationApiRow[]>>(
      "/notifications/unread",
      { method: "GET" }
    )
    const items = mapDadosToNotificationItems(res.dados)
    return items.filter((n) => n.read !== true)
  } catch {
    try {
      const res = await apiFetch<ApiResponse<NotificationApiRow[]>>(
        "/notifications",
        { method: "GET" }
      )
      return mapDadosToNotificationItems(res.dados).filter((n) => n.read !== true)
    } catch {
      return []
    }
  }
}

/**
 * PATCH /notifications/:id — marca uma notificação como lida.
 * Ajuste path/body se o backend expuser outro contrato (ex. POST …/read).
 */
export async function markNotificationRead(id: string | number) {
  const sid = encodeURIComponent(String(id))
  return apiFetch<ApiResponse<NotificationItem>>(`/notifications/${sid}`, {
    method: "PATCH",
    body: JSON.stringify({ read: true }),
  })
}

/** PATCH /notifications/read-all — marca todas como lidas (sem corpo). */
export async function markAllNotificationsRead() {
  return apiFetch<ApiResponse<NotificationsCountDados>>("/notifications/read-all", {
    method: "PATCH",
  })
}
