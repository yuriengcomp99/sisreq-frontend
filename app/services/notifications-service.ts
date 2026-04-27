import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

/** Corpo de `dados` em respostas de contagem de notificações. */
export interface NotificationsCountDados {
  count: number
}

/** GET /notifications/unread-count — notificações com `read = false`. */
export async function getUnreadNotificationCount() {
  return apiFetch<ApiResponse<NotificationsCountDados>>(
    "/notifications/unread-count",
    { method: "GET" }
  )
}

/** POST /notifications/read-all — marca todas como lidas. */
export async function markAllNotificationsRead() {
  return apiFetch<ApiResponse<NotificationsCountDados>>("/notifications/read-all", {
    method: "POST",
  })
}
