"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { FilePlus } from "lucide-react"
import { DataTable } from "@/app/components/ui/data-table"
import { Tooltip } from "@/app/components/ui/tooltip"
import { formatCurrency, formatNumber } from "@/app/lib/format"
import type { CapacidadeItem } from "@/app/services/capacidade-service"

function criarRequisicaoHref(pregao: string, ugg: string) {
  return `/requisicao/criar?pregao=${encodeURIComponent(pregao.trim())}&ugg=${encodeURIComponent(ugg.trim())}`
}

function podeGerarRequisicao(item: CapacidadeItem) {
  const temSaldo = item.qtdSaldo > 0
  const temPregaoUgg =
    Boolean(item.pregao?.trim()) && Boolean(item.ugg?.trim())
  return temSaldo && temPregaoUgg
}

interface CapacidadeTableProps {
  data: CapacidadeItem[]
}

export function CapacidadeTable({ data }: CapacidadeTableProps) {
  const columns: ColumnDef<CapacidadeItem>[] = useMemo(
    () => [
      {
        accessorKey: "nrItem",
        header: "Nº item",
        size: 72,
      },
      {
        accessorKey: "descricao",
        header: "Descrição",
        cell: ({ row }) => {
          const value = row.getValue("descricao") as string
          return (
            <Tooltip content={value}>
              <div className="max-w-[240px] cursor-default truncate text-zinc-600">
                {value}
              </div>
            </Tooltip>
          )
        },
      },
      {
        accessorKey: "valorUnitario",
        header: "Valor unitário",
        cell: ({ row }) => {
          const value = row.getValue("valorUnitario") as number
          return (
            <span className="whitespace-nowrap font-semibold text-green-600">
              {formatCurrency(value)}
            </span>
          )
        },
      },
      {
        accessorKey: "qtdSaldo",
        header: "Qtd. saldo",
        cell: ({ row }) => {
          const value = row.getValue("qtdSaldo") as number
          return (
            <span className="whitespace-nowrap font-semibold text-blue-600">
              {formatNumber(value)}
            </span>
          )
        },
      },
      {
        accessorKey: "saldoDisponivel",
        header: "Saldo disponível",
        cell: ({ row }) => {
          const value = row.getValue("saldoDisponivel") as number
          return (
            <span className="whitespace-nowrap font-semibold text-purple-600">
              {formatCurrency(value)}
            </span>
          )
        },
      },
      {
        id: "acoes",
        header: "Ações",
        size: 160,
        cell: ({ row }) => {
          const item = row.original
          const liberado = podeGerarRequisicao(item)
          const titleBloqueio = !item.pregao?.trim() || !item.ugg?.trim()
            ? "Pregão ou UGG ausentes nos dados."
            : item.qtdSaldo <= 0
              ? "Sem saldo (quantidade zero)."
              : "Gerar requisição"

          const linkClass =
            "inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white transition bg-custom-blue hover:opacity-90"
          const bloqueadoClass =
            "inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-zinc-500 bg-zinc-200 dark:bg-zinc-700"

          return (
            <div className="flex justify-end">
              {liberado ? (
                <Link
                  href={criarRequisicaoHref(item.pregao, item.ugg)}
                  className={linkClass}
                  title="Gerar requisição"
                >
                  <FilePlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Gerar requisição
                </Link>
              ) : (
                <span className={bloqueadoClass} title={titleBloqueio}>
                  <FilePlus className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                  Gerar requisição
                </span>
              )}
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="descricao"
      searchPlaceholder="Buscar por descrição"
    />
  )
}
