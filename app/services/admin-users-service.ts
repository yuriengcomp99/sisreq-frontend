import { apiFetch } from "@/app/lib/api"
import type { User } from "@/app/services/auth-service"
import type { ApiResponse } from "@/app/services/pregoes-service"

function adminUserByIdPath(id: string) {
  return `/auth/users/${encodeURIComponent(id)}`
}

/** Corpo para cadastro de usuário pelo administrador. */
export interface CreateAdminUserPayload {
  email: string
  password: string
  first_name: string
  army_name: string
  graduation: string
  role: string
  om: string
  designationId: string
}

export type UpdateAdminUserPayload = Partial<
  Omit<CreateAdminUserPayload, "email" | "password">
> & {
  email?: string
  password?: string
}

/** Lista todos os usuários (admin). */
export async function listAdminUsers() {
  return apiFetch<ApiResponse<User[]>>("/auth/users", {
    method: "GET",
  })
}

/** Cadastra usuário (admin). */
export async function createAdminUser(body: CreateAdminUserPayload) {
  return apiFetch<ApiResponse<User>>("/auth/users", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** Busca usuário por ID (admin). */
export async function getAdminUserById(id: string) {
  return apiFetch<ApiResponse<User>>(adminUserByIdPath(id), {
    method: "GET",
  })
}

/** Atualiza usuário por ID (admin). */
export async function updateAdminUser(id: string, body: UpdateAdminUserPayload) {
  return apiFetch<ApiResponse<User>>(adminUserByIdPath(id), {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

/** Exclui usuário por ID (admin). */
export async function deleteAdminUser(id: string) {
  return apiFetch<ApiResponse<unknown>>(adminUserByIdPath(id), {
    method: "DELETE",
  })
}
