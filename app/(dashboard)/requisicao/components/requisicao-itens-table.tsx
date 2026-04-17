"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Calculator, ChevronLeft, ChevronRight, Coins, Package } from "lucide-react"
import type { Item } from "@/app/services/pregoes-service"
import type { RequisicaoItemLinha } from "@/app/services/requisicao-service"
import { formatCurrency, formatNumber } from "@/app/lib/format"
import { Tooltip } from "@/app/components/ui/tooltip"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"

function itemToLinha(item: Item, index: number): RequisicaoItemLinha {
  return {
    key: `${item.nrItem}-${index}-${item.descricao.slice(0, 8)}`,
    nrItem: item.nrItem,
    descricao: item.descricao,
    fornecedor: item.fornecedor,
    valorUnitario: item.valorUnitario,
    qtdSaldo: item.qtdSaldo,
    subitem: "",
    und: "",
    qtd: 0,
  }
}

function clampQtd(raw: string, max: number): number {
  const n = Number.parseFloat(raw.replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return 0
  return max > 0 ? Math.min(n, max) : n
}

type RequisicaoItensTableProps = {
  loading?: boolean
  items: Item[]
  onLinhasChange: (linhas: RequisicaoItemLinha[]) => void
}

export function RequisicaoItensTable({
  loading,
  items,
  onLinhasChange,
}: RequisicaoItensTableProps) {
  const [linhas, setLinhas] = useState<RequisicaoItemLinha[]>([])
  const [globalFilter, setGlobalFilter] = useState("")

  /** Evita atualizar o pai durante o setState do filho (e deps instáveis do callback). */
  const onLinhasChangeRef = useRef(onLinhasChange)
  onLinhasChangeRef.current = onLinhasChange

  useEffect(() => {
    onLinhasChangeRef.current(linhas)
  }, [linhas])

  const syncFromItems = useCallback(() => {
    if (!items.length) {
      setLinhas([])
      return
    }
    setLinhas(items.map(itemToLinha))
  }, [items])

  useEffect(() => {
    syncFromItems()
  }, [syncFromItems])

  const updateLinhaByKey = useCallback(
    (key: string, patch: Partial<RequisicaoItemLinha>) => {
      setLinhas((prev) =>
        prev.map((row) =>
          row.key === key ? { ...row, ...patch } : row
        )
      )
    },
    []
  )

  const totalGeral = useMemo(() => {
    return linhas.reduce((acc, row) => {
      return acc + row.qtd * row.valorUnitario
    }, 0)
  }, [linhas])

  /** Identifica o lote vindo da API; muda ao trocar de pregão/UGG, não ao editar linhas. */
  const itemsSourceKey = useMemo(
    () => items.map((it, idx) => `${idx}:${it.nrItem}:${it.descricao}`).join("|"),
    [items]
  )

  const columns = useMemo<ColumnDef<RequisicaoItemLinha>[]>(
    () => [
      {
        accessorKey: "nrItem",
        header: "Item",
        cell: ({ row }) => (
          <span className="font-medium text-custom-blue">{row.original.nrItem}</span>
        ),
      },
      {
        accessorKey: "descricao",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="max-w-[240px]">
            <Tooltip content={row.original.descricao}>
              <span className="line-clamp-2 cursor-default text-zinc-700">
                {row.original.descricao}
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        accessorKey: "fornecedor",
        header: "Fornecedor",
        cell: ({ row }) => (
          <div className="max-w-[140px] text-zinc-600">
            <Tooltip content={row.original.fornecedor}>
              <span className="line-clamp-2">{row.original.fornecedor}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        id: "subitem",
        header: "Subitem",
        cell: ({ row }) => {
          const r = row.original
          return (
            <input
              type="text"
              value={r.subitem}
              onChange={(e) =>
                updateLinhaByKey(r.key, { subitem: e.target.value })
              }
              className="w-full min-w-[3rem] rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue"
            />
          )
        },
      },
      {
        id: "und",
        header: "UND",
        cell: ({ row }) => {
          const r = row.original
          return (
            <input
              type="text"
              value={r.und}
              onChange={(e) =>
                updateLinhaByKey(r.key, { und: e.target.value })
              }
              className="w-full min-w-[3rem] rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue"
            />
          )
        },
      },
      {
        accessorKey: "qtdSaldo",
        header: () => <span className="block text-center">Saldo</span>,
        cell: ({ row }) => (
          <div className="text-center tabular-nums font-semibold text-zinc-700">
            {formatNumber(row.original.qtdSaldo)}
          </div>
        ),
      },
      {
        id: "qtd",
        header: "Qtd",
        cell: ({ row }) => {
          const r = row.original
          return (
            <input
              type="number"
              min={0}
              max={r.qtdSaldo > 0 ? r.qtdSaldo : undefined}
              step="any"
              value={r.qtd}
              onChange={(e) => {
                const qtd = clampQtd(e.target.value, r.qtdSaldo)
                updateLinhaByKey(r.key, { qtd })
              }}
              className="w-full min-w-[4.5rem] rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm tabular-nums outline-none focus:border-custom-blue focus:ring-1 focus:ring-custom-blue"
            />
          )
        },
      },
      {
        accessorKey: "valorUnitario",
        header: "Vl. unitário",
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-semibold text-emerald-700">
            {formatCurrency(row.original.valorUnitario)}
          </span>
        ),
      },
      {
        id: "capTotal",
        header: "Cap. total",
        cell: ({ row }) => {
          const cap = row.original.valorUnitario * row.original.qtdSaldo
          return (
            <span className="whitespace-nowrap font-semibold text-violet-700">
              {formatCurrency(cap)}
            </span>
          )
        },
      },
      {
        id: "totalReq",
        header: "Total req.",
        cell: ({ row }) => {
          const t = row.original.qtd * row.original.valorUnitario
          return (
            <span className="whitespace-nowrap font-bold text-custom-blue">
              {formatCurrency(t)}
            </span>
          )
        },
      },
    ],
    [updateLinhaByKey]
  )

  const table = useReactTable({
    data: linhas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .toLowerCase()
        .trim()
      if (!q) return true
      const r = row.original
      const hay = `${r.nrItem} ${r.descricao} ${r.fornecedor} ${r.subitem} ${r.und}`.toLowerCase()
      return hay.includes(q)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
    /** Sem isso, qualquer atualização em `linhas` (ex.: qtd) zera a página. */
    autoResetPageIndex: false,
  })

  const tableRef = useRef(table)
  tableRef.current = table

  useEffect(() => {
    tableRef.current.setPageIndex(0)
  }, [globalFilter])

  useEffect(() => {
    tableRef.current.setPageIndex(0)
  }, [itemsSourceKey])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg bg-zinc-200"
          />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600">
        Nenhum item carregado para este pregão / UGG.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Input
          placeholder="Buscar itens"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-9 max-w-xs text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] bg-white text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-200 bg-white"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-3 py-3 font-semibold text-zinc-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((tableRow) => (
                <tr
                  key={tableRow.id}
                  className="border-b border-zinc-100 bg-white transition hover:bg-zinc-50"
                >
                  {tableRow.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-zinc-500"
                >
                  Nenhum item encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          Página {table.getState().pagination.pageIndex + 1}
          {table.getPageCount() > 0
            ? ` de ${table.getPageCount()}`
            : ""}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div
        className="
          flex flex-col gap-3 rounded-2xl border-2 border-custom-blue/25
          bg-gradient-to-br from-slate-50 via-white to-blue-50/60
          px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex h-14 w-14 shrink-0 items-center justify-center rounded-xl
              bg-custom-blue text-white shadow-md
            "
          >
            <Calculator className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <Coins className="h-3.5 w-3.5" />
              Total da requisição
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Soma dos totais por linha (qtd × valor unitário)
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-2 sm:text-right">
          <Package className="hidden h-5 w-5 text-custom-blue sm:inline" />
          <span className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900 sm:text-4xl">
            {formatCurrency(totalGeral)}
          </span>
        </div>
      </div>
    </div>
  )
}
