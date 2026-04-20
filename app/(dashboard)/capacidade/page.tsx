"use client"

import { useEffect, useState } from "react"
import { CapacidadeTable } from "@/app/(dashboard)/capacidade/components/capacidade-table"
import {
  getCapacidade,
  type CapacidadeItem,
} from "@/app/services/capacidade-service"

export default function CapacidadePage() {
  const [itens, setItens] = useState<CapacidadeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getCapacidade()
        if (!cancelled) setItens(res.dados ?? [])
      } catch (e) {
        console.error(e)
        if (!cancelled) setItens([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="h-8 w-80 max-w-full animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
        </div>

        <div className="space-y-4 rounded-xl">
          <div className="flex justify-end">
            <div className="h-9 w-full max-w-xs animate-pulse rounded-md border border-transparent bg-gray-200" />
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-3.5 w-14 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3.5 min-w-0 flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3.5 w-24 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3.5 w-20 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3.5 w-28 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
              <div className="h-3.5 w-32 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-t border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="h-4 w-14 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 min-w-0 flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-16 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-28 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-32 shrink-0 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Capacidade de empenho
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Itens e saldos disponíveis para empenho.
        </p>
      </div>

      <CapacidadeTable data={itens} />
    </div>
  )
}
