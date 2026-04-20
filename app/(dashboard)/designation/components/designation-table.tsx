"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { FiEdit2, FiTrash2 } from "react-icons/fi"
import { DataTable } from "@/app/components/ui/data-table"
import { Tooltip } from "@/app/components/ui/tooltip"
import type { Designation } from "@/app/services/designation-service"

interface DesignationTableProps {
  data: Designation[]
  onEdit: (row: Designation) => void
  onDelete: (row: Designation) => void
}

export function DesignationTable({
  data,
  onEdit,
  onDelete,
}: DesignationTableProps) {
  const columns: ColumnDef<Designation>[] = useMemo(
    () => [
      {
        accessorKey: "position",
        header: "Setor",
        cell: ({ row }) => {
          const value = row.getValue("position") as string
          return (
            <Tooltip content={value}>
              <div className="max-w-xl truncate font-medium text-zinc-800 cursor-default">
                {value}
              </div>
            </Tooltip>
          )
        },
      },
      {
        id: "acoes",
        header: "Ações",
        size: 120,
        cell: ({ row }) => {
          const d = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                title="Editar"
                onClick={() => onEdit(d)}
                className="rounded p-2 text-custom-blue transition hover:bg-blue-50 cursor-pointer"
              >
                <FiEdit2 size={18} aria-hidden />
              </button>
              <button
                type="button"
                title="Excluir"
                onClick={() => onDelete(d)}
                className="rounded p-2 text-red-600 transition hover:bg-red-50 cursor-pointer"
              >
                <FiTrash2 size={18} aria-hidden />
              </button>
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="position"
      searchPlaceholder="Buscar setor"
    />
  )
}
