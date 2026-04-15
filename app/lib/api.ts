const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token")

  const authorization = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authorization && {
      Authorization: authorization,
    }),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const raw = await res.text()
  const contentType = res.headers.get("content-type") || ""
  const isJson = contentType.includes("application/json")

  const data = isJson && raw ? JSON.parse(raw) : raw

  if (!res.ok) {
    const message =
      (isJson && typeof data === "object" && data
        ? (
            (data as Record<string, unknown>).mensagem ?? // ✅ prioridade pt-br
            (data as Record<string, unknown>).message ??
            (data as Record<string, unknown>).error
          )
        : null) || `Erro na requisição (${res.status})`

    throw new Error(String(message))
  }

  return data
}