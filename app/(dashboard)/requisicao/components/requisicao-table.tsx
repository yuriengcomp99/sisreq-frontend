"use client"

import { useMemo } from "react"
import { DataTable } from "@/app/components/ui/data-table"
import type { RequisicaoLista } from "@/app/services/requisicao-service"
import { createRequisicaoTableColumns } from "./requisicao-table-config"

interface RequisicaoTableProps {
  data: RequisicaoLista[]
}

export function RequisicaoTable({ data }: RequisicaoTableProps) {
  const columns = useMemo(() => createRequisicaoTableColumns(), [])

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nup"
      searchPlaceholder="Buscar por NUP, DIEX, tipo ou pregão"
    />
  )
}
