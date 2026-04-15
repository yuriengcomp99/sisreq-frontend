import { apiFetch } from "@/app/lib/api"

export interface ApiResponse<T> {
  sucesso: boolean
  mensagem: string
  dados: T
}

export async function importPregoes(file: File) {
  const formData = new FormData()

  formData.append("file", file)

  return apiFetch<ApiResponse<null>>("/pregoes/import", {
    method: "POST",
    body: formData,
  })
}