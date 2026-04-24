"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { FiEdit2 } from "react-icons/fi"
import { Tooltip } from "@/app/components/ui/tooltip"
import { formatCurrency, formatDate } from "@/app/lib/format"
import type { RequisicaoLista } from "@/app/services/requisicao-service"

function cellText(value: string | null | undefined) {
  const t = (value ?? "").trim()
  return t.length ? t : "—"
}

export function createRequisicaoTableColumns(): ColumnDef<RequisicaoLista>[] {
  return [
    {
      accessorKey: "numero_diex",
      header: "Nº DIEX",
      size: 88,
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-zinc-800">
          {cellText(row.original.numero_diex)}
        </span>
      ),
    },
    {
      accessorKey: "nup",
      header: "NUP",
      size: 120,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {cellText(row.original.nup)}
        </span>
      ),
    },
    {
      accessorKey: "data_req",
      header: "Data",
      size: 104,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {row.original.data_req
            ? formatDate(row.original.data_req)
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      size: 110,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {cellText(row.original.tipo)}
        </span>
      ),
    },
    {
      accessorKey: "nr_pregao",
      header: "Pregão",
      size: 120,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {cellText(row.original.nr_pregao)}
        </span>
      ),
    },
    {
      accessorKey: "descricao_necessidade",
      header: "Descrição da necessidade",
      cell: ({ row }) => {
        const value = cellText(row.original.descricao_necessidade)
        return (
          <Tooltip content={value}>
            <div className="max-w-[280px] cursor-default truncate text-zinc-600">
              {value}
            </div>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "valorTotal",
      header: "Valor total",
      size: 128,
      cell: ({ row }) => {
        const v = row.original.valorTotal
        return (
          <span className="whitespace-nowrap font-semibold tabular-nums text-green-600">
            {v != null ? formatCurrency(v) : "—"}
          </span>
        )
      },
    },
    {
      id: "acoes",
      header: "Ações",
      size: 88,
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex items-center justify-end">
            <Link
              href={`/requisicao/${id}/editar`}
              title="Editar requisição"
              className="inline-flex cursor-pointer rounded p-2 text-custom-blue transition hover:bg-blue-50"
            >
              <FiEdit2 size={18} aria-hidden />
              <span className="sr-only">Editar requisição</span>
            </Link>
          </div>
        )
      },
    },
  ]
}
