import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

export interface CapacidadeItem {
  nrItem: string
  descricao: string
  valorUnitario: number
  qtdSaldo: number
  saldoDisponivel: number
  /** Pregão vinculado — usado em `/requisicao/criar?pregao=&ugg=`. */
  pregao: string
  /** UGG vinculada — usada na mesma URL. */
  ugg: string
}

export async function getCapacidade() {
  return apiFetch<ApiResponse<CapacidadeItem[]>>("/capacidade", {
    method: "GET",
  })
}
