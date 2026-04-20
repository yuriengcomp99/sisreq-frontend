"use client"

import { useMemo } from "react"
import { DataTable } from "@/app/components/ui/data-table"
import type { NotaCredito } from "@/app/services/nota-credito-service"
import { createNotaCreditoTableColumns } from "./nota-credito-table-config"

interface NotaCreditoTableProps {
  data: NotaCredito[]
  onEdit: (row: NotaCredito) => void
  onDelete: (row: NotaCredito) => void
}

export function NotaCreditoTable({
  data,
  onEdit,
  onDelete,
}: NotaCreditoTableProps) {
  const columns = useMemo(
    () => createNotaCreditoTableColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="numero"
      searchPlaceholder="Buscar por número, emitente ou favorecido"
    />
  )
}
