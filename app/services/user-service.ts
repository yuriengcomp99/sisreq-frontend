import { apiFetch } from "@/app/lib/api"

export async function getProfile() {
  return apiFetch("/users/me")
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