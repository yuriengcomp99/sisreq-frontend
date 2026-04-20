import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

export interface NotaCredito {
  id: string
  numero?: string
  emitente?: string
  favorecido?: string
  observacao?: string | null
  descricao?: string
  prazo?: string
  valor?: number
}

export interface CreateNotaCreditoPayload {
  numero: string
  emitente: string
  favorecido: string
  observacao: string
  prazo: string
  valor: number
}

export type UpdateNotaCreditoPayload = Partial<CreateNotaCreditoPayload>

function notaCreditoByIdPath(id: string) {
  return `/nota-credito/${encodeURIComponent(id)}/`
}

export async function getNotasCredito() {
  return apiFetch<ApiResponse<NotaCredito[]>>("/nota-credito", {
    method: "GET",
  })
}

export async function getNotaCreditoById(id: string) {
  return apiFetch<ApiResponse<NotaCredito>>(notaCreditoByIdPath(id), {
    method: "GET",
  })
}

export async function createNotaCredito(body: CreateNotaCreditoPayload) {
  return apiFetch<ApiResponse<NotaCredito>>("/nota-credito", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateNotaCredito(
  id: string,
  body: UpdateNotaCreditoPayload
) {
  return apiFetch<ApiResponse<NotaCredito>>(notaCreditoByIdPath(id), {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteNotaCredito(id: string) {
  return apiFetch<ApiResponse<unknown>>(notaCreditoByIdPath(id), {
    method: "DELETE",
  })
}
