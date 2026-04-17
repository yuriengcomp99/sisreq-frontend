import { apiFetch } from "@/app/lib/api"
import type { ApiResponse, Item } from "@/app/services/pregoes-service"

export interface RequisicaoItemPayload {
  nr_item: string
  descricao: string
  subitem: string
  und: string
  qtd: number
  valor_unitario: number
  valor_total: number
}

export interface CreateRequisicaoPayload {
  /** ISO `YYYY-MM-DD` */
  data: string
  numero_diex: string
  nup: string
  de: string
  para: string
  assunto: string
  tipo: string
  ug: string
  nome_da_ug: string
  descricao_necessidade: string
  notaCreditoId: string
  empenho_tipo: "ORDINARIO" | "ESTIMATIVO" | "GLOBAL"
  contrato: boolean
  classe_grupo_pca: string
  nr_contratacao_pca: string
  usuarioId: string
  itens: RequisicaoItemPayload[]
}

/** Linha editável na tela de nova requisição (vem do pregão + campos do usuário). */
export type RequisicaoItemLinha = {
  key: string
  nrItem: string
  descricao: string
  fornecedor: string
  valorUnitario: number
  /** Saldo do pregão (base para “capacidade total”). */
  qtdSaldo: number
  subitem: string
  und: string
  qtd: number
}

/** Monta o payload a partir das linhas editadas na tabela. */
export function mapLinhasToRequisicaoPayload(
  linhas: RequisicaoItemLinha[]
): RequisicaoItemPayload[] {
  return linhas.map((linha) => {
    const vu = linha.valorUnitario
    const qtd = linha.qtd
    return {
      nr_item: linha.nrItem,
      descricao: linha.descricao,
      subitem: linha.subitem.trim(),
      und: linha.und.trim(),
      qtd,
      valor_unitario: vu,
      valor_total: vu * qtd,
    }
  })
}

/** @deprecated Prefira mapLinhasToRequisicaoPayload com a tabela editável. */
export function mapPregaoItensToRequisicaoPayload(
  itens: Item[]
): RequisicaoItemPayload[] {
  return itens.map((item) => {
    const qtd = item.qtdSaldo
    const vu = item.valorUnitario
    return {
      nr_item: item.nrItem,
      descricao: item.descricao,
      subitem: "A",
      und: "UN",
      qtd,
      valor_unitario: vu,
      valor_total: vu * qtd,
    }
  })
}

export async function createRequisicao(payload: CreateRequisicaoPayload) {
  return apiFetch<ApiResponse<unknown>>("/requisicoes", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
