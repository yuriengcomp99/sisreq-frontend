import { apiFetch } from "@/app/lib/api"

export interface ApiResponse<T> {
  sucesso: boolean
  mensagem: string
  dados: T
}

export interface Pregao {
  pregao: string
  objeto: string
  ugg: string
  tipoUasg: string
  inicioVigAta: string
  fimVigAta: string
  qtdItensDisponiveis: number
}

export interface Item {
  nrItem: string
  descricao: string
  fornecedor: string
  valorUnitario: number
  qtdSaldo: number
}

export async function importPregoes(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return apiFetch<ApiResponse<null>>("/pregoes/import", {
    method: "POST",
    body: formData,
  })
}

export async function getPregoes() {
  return apiFetch<ApiResponse<Pregao[]>>("/pregoes", {
    method: "GET",
  })
}

export async function getPregaoItens(
  pregao: string,
  ugg: string,
  search?: string
) {
  let url = `/pregoes/${pregao}/${ugg}/itens`

  if (search) {
    url += `?search=${encodeURIComponent(search)}`
  }

  return apiFetch<ApiResponse<Item[]>>(url, {
    method: "GET",
  })
}