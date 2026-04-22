"use client"

import { useMemo } from "react"
import { DataTable } from "@/app/components/ui/data-table"
import type { User } from "@/app/services/auth-service"
import { createUsersAdminTableColumns } from "./users-admin-table-config"

interface UsersAdminTableProps {
  data: User[]
  onEdit: (row: User) => void
}

export function UsersAdminTable({ data, onEdit }: UsersAdminTableProps) {
  const columns = useMemo(
    () => createUsersAdminTableColumns({ onEdit }),
    [onEdit]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="first_name"
      searchPlaceholder="Buscar por nome, e-mail ou função"
    />
  )
}
