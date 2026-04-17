import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

export interface NotaCredito {
  id: string
  numero?: string
  emitente?: string
  observacao?: string | null
  /** fallback legado */
  descricao?: string
}

/**
 * Lista notas de crédito disponíveis.
 * Ajuste o path se o back expuser outro (ex.: /nota-credito/list).
 */
export async function getNotasCredito() {
  return apiFetch<ApiResponse<NotaCredito[]>>("/nota-credito", {
    method: "GET",
  })
}
