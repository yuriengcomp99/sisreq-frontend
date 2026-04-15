import { apiFetch } from "@/app/lib/api"

export interface User {
  id: string
  first_name: string
  army_name: string
  graduation: string
  email: string
  role: string
  om: string
  designation: {
    id: string
    position: string
  }
  createdAt: string
}

export interface ApiResponse<T> {
  sucesso: boolean
  mensagem: string
  dados: T
}

export interface LoginResponse extends ApiResponse<{
  accessToken: string
  user: User
}> {}

export async function login(data: {
  email: string
  password: string
}): Promise<LoginResponse> {
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

export async function getProfile() {
  const response = await apiFetch<ApiResponse<User>>("/auth/me")

  const user = response.dados

  return {
    ...user,
    name: user.first_name,
  }
}

export async function updateUser(data: {
  name?: string
  email?: string
  password?: string
}) {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteAccount() {
  return apiFetch("/users/me", {
    method: "DELETE",
  })
}