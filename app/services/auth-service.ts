import { apiFetch } from "@/app/lib/api"

export async function login(data: {
  email: string
  password: string
}) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function register(data: {
  name: string
  email: string
  password: string
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}