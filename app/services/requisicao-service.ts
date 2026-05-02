import { apiFetch, apiFetchBinary, type ApiBinaryResult } from "@/app/lib/api"
import type { ApiResponse, Item } from "@/app/services/pregoes-service"

/** Campos da requisição na listagem GET /requisicoes (sem `detalhes`; com total). */
export type RequisicaoLista = {
  id: string
  numero_diex: string
  nup: string
  data_req: string
  de: string
  para: string
  assunto: string
  tipo: string
  nr_pregao: string
  ug: string
  nome_da_ug: string
  descricao_necessidade: string
  notaCreditoId: string | null
  empenho_tipo: string
  contrato: string
  classe_grupo_pca: string
  nr_contratacao_pca: string
  userId: string
  createdAt: string
  updatedAt: string
  /** Soma dos `valor_total` dos itens (detalhes não vêm na listagem). */
  valorTotal: number
}

export interface RequisicaoItemPayload {
  nr_item: string
  descricao: string
  subitem: string
  und: string
  qtd: number
  valor_unitario: number
  valor_total: number
}

/**
 * Corpo esperado pelo backend (Prisma + CreateRequisicaoUseCase):
 * `detalhes`, `data_req`, `userId`, `nr_pregao`, `contrato` SIM|NAO.
 */
export interface CreateRequisicaoPayload {
  /** ISO `YYYY-MM-DD` — o use case faz `new Date(data.data_req)` */
  data_req: string
  numero_diex: string
  nup: string
  de: string
  para: string
  assunto: string
  tipo: string
  nr_pregao: string
  ug: string
  nome_da_ug: string
  descricao_necessidade: string
  notaCreditoId: string | null
  empenho_tipo: "ORDINARIO" | "ESTIMATIVO" | "GLOBAL"
  contrato: "SIM" | "NAO"
  classe_grupo_pca: string
  nr_contratacao_pca: string
  userId: string
  detalhes: RequisicaoItemPayload[]
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
  /** Ao editar: id do detalhe no backend (`PATCH` com `itens[].id`). */
  detalheId?: string | null
}

/** Detalhe retornado por `GET /requisicoes/:id` (Prisma). */
export type RequisicaoDetalheApi = {
  id: string
  nr_item: string
  descricao: string
  subitem: string
  und: string
  qtd: number
  valor_unitario: number
  valor_total: number
}

/** Requisição completa com itens (`GET /requisicoes/:id`). */
export type RequisicaoPorId = {
  id: string
  numero_diex: string
  nup: string
  data_req: string
  de: string
  para: string
  assunto: string
  tipo: string
  nr_pregao: string
  ug: string
  nome_da_ug: string
  descricao_necessidade: string
  notaCreditoId: string | null
  empenho_tipo: string
  contrato: string
  classe_grupo_pca: string
  nr_contratacao_pca: string
  userId: string
  detalhes: RequisicaoDetalheApi[]
}

/**
 * Item existente: `id` + campos editáveis (sem `nr_item`, conforme PATCH na doc).
 * Item novo: sem `id`, com `nr_item` e demais campos obrigatórios.
 */
export type UpdateRequisicaoItemPayload =
  | {
      id: string
      descricao: string
      subitem: string
      und: string
      qtd: number
      valor_unitario: number
      valor_total: number
    }
  | {
      nr_item: string
      descricao: string
      subitem: string
      und: string
      qtd: number
      valor_unitario: number
      valor_total: number
    }

/** Corpo do `PATCH /requisicoes/:id` (use case espera `itens`, não `detalhes`). */
export type UpdateRequisicaoPayload = {
  data_req: string
  numero_diex: string
  nup: string
  de: string
  para: string
  assunto: string
  tipo: string
  nr_pregao: string
  ug: string
  nome_da_ug: string
  descricao_necessidade: string
  notaCreditoId: string | null
  empenho_tipo: "ORDINARIO" | "ESTIMATIVO" | "GLOBAL"
  contrato: "SIM" | "NAO"
  classe_grupo_pca: string
  nr_contratacao_pca: string
  itens: UpdateRequisicaoItemPayload[]
}

/**
 * Separa linhas da tabela de itens para montagem do payload:
 * - `completas`: subitem e UND (após trim) preenchidos e quantidade > 0 — entram no POST.
 * - `parciais`: usuário começou a preencher algum de (subitem, UND, qtd) mas não os três
 *   válidos juntos — devem gerar erro de validação na UI.
 * Linhas totalmente vazias (nada preenchido / qtd 0) são ignoradas.
 */
export function partitionLinhasItensParaPayload(linhas: RequisicaoItemLinha[]): {
  completas: RequisicaoItemLinha[]
  parciais: RequisicaoItemLinha[]
} {
  const completas: RequisicaoItemLinha[] = []
  const parciais: RequisicaoItemLinha[] = []

  for (const linha of linhas) {
    const sub = linha.subitem.trim()
    const und = linha.und.trim()
    const qtd = linha.qtd

    const algum = sub !== "" || und !== "" || qtd > 0
    const completa = sub !== "" && und !== "" && qtd > 0

    if (completa) completas.push(linha)
    else if (algum) parciais.push(linha)
  }

  return { completas, parciais }
}

/** Monta os detalhes a partir das linhas editadas na tabela. */
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

/** Monta `itens` para `PATCH /requisicoes/:id` (existente vs novo, conforme documentação da API). */
export function mapLinhasToUpdateItensPayload(
  linhas: RequisicaoItemLinha[]
): UpdateRequisicaoItemPayload[] {
  return linhas.map((linha) => {
    const vu = linha.valorUnitario
    const qtd = linha.qtd
    const valor_total = vu * qtd
    const descricao = linha.descricao
    const subitem = linha.subitem.trim()
    const und = linha.und.trim()
    const id = linha.detalheId?.trim()
    if (id) {
      return {
        id,
        descricao,
        subitem,
        und,
        qtd,
        valor_unitario: vu,
        valor_total,
      }
    }
    return {
      nr_item: linha.nrItem,
      descricao,
      subitem,
      und,
      qtd,
      valor_unitario: vu,
      valor_total,
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

/** Lista requisições com `valorTotal`; não inclui itens (`detalhes`). */
export async function getRequisicoes() {
  return apiFetch<ApiResponse<RequisicaoLista[]>>("/requisicoes", {
    method: "GET",
  })
}

export async function getRequisicaoById(id: string) {
  return apiFetch<ApiResponse<RequisicaoPorId>>(`/requisicoes/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function updateRequisicao(id: string, payload: UpdateRequisicaoPayload) {
  return apiFetch<ApiResponse<unknown>>(
    `/requisicoes/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

/** `GET /requisicoes/emitir/pdf/:id` — in-memory PDF (`Content-Disposition: attachment`). */
export async function emitirRequisicaoPdf(id: string): Promise<ApiBinaryResult> {
  return apiFetchBinary(`/requisicoes/emitir/pdf/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

/** `GET /requisicoes/emitir/word/:id` — in-memory DOCX (`Content-Disposition: attachment`). */
export async function emitirRequisicaoWord(id: string): Promise<ApiBinaryResult> {
  return apiFetchBinary(`/requisicoes/emitir/word/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}
