"use client"

import { useMemo } from "react"
import { DataTable } from "@/app/components/ui/data-table"
import type { User } from "@/app/services/auth-service"
import { createUsersAdminTableColumns } from "./users-admin-table-config"

interface UsersAdminTableProps {
  data: User[]
}

export function UsersAdminTable({ data }: UsersAdminTableProps) {
  const columns = useMemo(() => createUsersAdminTableColumns(), [])

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="first_name"
      searchPlaceholder="Buscar por nome, e-mail ou função"
    />
  )
}
