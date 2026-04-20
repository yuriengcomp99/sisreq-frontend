import { apiFetch } from "@/app/lib/api"
import type { ApiResponse } from "@/app/services/pregoes-service"

export interface Designation {
  id: string
  position: string
  createdAt: string
}

export interface DesignationWriteBody {
  position: string
}

function designationByIdPath(id: string) {
  return `/designation/${encodeURIComponent(id)}/`
}

export async function getDesignations() {
  return apiFetch<ApiResponse<Designation[]>>("/designation", {
    method: "GET",
  })
}

export async function createDesignation(body: DesignationWriteBody) {
  return apiFetch<ApiResponse<Designation>>("/designation", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateDesignation(
  id: string,
  body: DesignationWriteBody
) {
  return apiFetch<ApiResponse<Designation>>(designationByIdPath(id), {
    method: "PATCH",
    body: JSON.stringify(body),
  })
}

export async function deleteDesignation(id: string) {
  return apiFetch<ApiResponse<unknown>>(designationByIdPath(id), {
    method: "DELETE",
  })
}
