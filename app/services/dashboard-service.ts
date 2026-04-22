import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

/** Métricas agregadas retornadas por GET /dashboard. */
export interface DashboardMetrics {
  totalRequisicoes: number
  totalItensComSaldoDisponivel: number
  totalLicitacoes: number
  creditoDisponivelReais: number
}

/** Resumo do dashboard: requisições, itens com saldo, licitações e crédito disponível (R$). */
export async function getDashboardSummary() {
  return apiFetch<ApiResponse<DashboardMetrics>>("/dashboard", {
    method: "GET",
  })
}
