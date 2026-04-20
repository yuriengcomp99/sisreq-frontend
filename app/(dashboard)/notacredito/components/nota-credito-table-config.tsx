"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FiEdit2, FiTrash2 } from "react-icons/fi"
import { Tooltip } from "@/app/components/ui/tooltip"
import { formatCurrency, formatDate } from "@/app/lib/format"
import type { NotaCredito } from "@/app/services/nota-credito-service"

export interface NotaCreditoTableActions {
  onEdit: (row: NotaCredito) => void
  onDelete: (row: NotaCredito) => void
}

function cellText(value: string | null | undefined) {
  const t = (value ?? "").trim()
  return t.length ? t : "—"
}

export function createNotaCreditoTableColumns({
  onEdit,
  onDelete,
}: NotaCreditoTableActions): ColumnDef<NotaCredito>[] {
  return [
    {
      accessorKey: "numero",
      header: "Número",
      size: 140,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-zinc-800">
          {cellText(row.original.numero)}
        </span>
      ),
    },
    {
      accessorKey: "emitente",
      header: "Emitente",
      cell: ({ row }) => {
        const value = cellText(row.original.emitente)
        return (
          <Tooltip content={value}>
            <div className="max-w-[200px] cursor-default truncate text-zinc-600">
              {value}
            </div>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "favorecido",
      header: "Favorecido",
      size: 120,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {cellText(row.original.favorecido)}
        </span>
      ),
    },
    {
      accessorKey: "observacao",
      header: "Observação",
      cell: ({ row }) => {
        const raw =
          row.original.observacao ?? row.original.descricao ?? ""
        const value = cellText(raw)
        return (
          <Tooltip content={value}>
            <div className="max-w-[260px] cursor-default truncate text-zinc-600">
              {value}
            </div>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "prazo",
      header: "Prazo",
      size: 110,
      cell: ({ row }) => {
        const p = row.original.prazo
        return (
          <span className="whitespace-nowrap text-zinc-700">
            {p ? formatDate(p) : "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "valor",
      header: "Valor",
      size: 120,
      cell: ({ row }) => {
        const v = row.original.valor
        return (
          <span className="whitespace-nowrap font-semibold text-green-600">
            {v != null ? formatCurrency(v) : "—"}
          </span>
        )
      },
    },
    {
      id: "acoes",
      header: "Ações",
      size: 120,
      cell: ({ row }) => {
        const n = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Editar"
              onClick={() => onEdit(n)}
              className="cursor-pointer rounded p-2 text-custom-blue transition hover:bg-blue-50"
            >
              <FiEdit2 size={18} aria-hidden />
            </button>
            <button
              type="button"
              title="Excluir"
              onClick={() => onDelete(n)}
              className="cursor-pointer rounded p-2 text-red-600 transition hover:bg-red-50"
            >
              <FiTrash2 size={18} aria-hidden />
            </button>
          </div>
        )
      },
    },
  ]
}
