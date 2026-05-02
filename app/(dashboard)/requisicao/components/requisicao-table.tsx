"use client"

import { useMemo } from "react"
import { DataTable } from "@/app/components/ui/data-table"
import type { RequisicaoLista } from "@/app/services/requisicao-service"
import { createRequisicaoTableColumns } from "./requisicao-table-config"

interface RequisicaoTableProps {
  data: RequisicaoLista[]
  onDelete: (row: RequisicaoLista) => void
}

export function RequisicaoTable({ data, onDelete }: RequisicaoTableProps) {
  const columns = useMemo(
    () => createRequisicaoTableColumns({ onDelete }),
    [onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nup"
      searchPlaceholder="Buscar por NUP, DIEX, tipo ou pregão"
    />
  )
}
