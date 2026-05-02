"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { FiPlus } from "react-icons/fi"
import Swal from "sweetalert2"
import { RequisicaoTable } from "@/app/(dashboard)/requisicao/components/requisicao-table"
import {
  deleteRequisicao,
  getRequisicoes,
  type RequisicaoLista,
} from "@/app/services/requisicao-service"

export default function RequisicaoPage() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoLista[]>([])
  const [loading, setLoading] = useState(true)

  const loadList = useCallback(async () => {
    const res = await getRequisicoes()
    setRequisicoes(res.dados ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await loadList()
      } catch (e) {
        console.error(e)
        if (!cancelled) setRequisicoes([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadList])

  const handleDelete = useCallback(async (row: RequisicaoLista) => {
    const label =
      (row.numero_diex ?? "").trim() ||
      (row.nup ?? "").trim() ||
      row.id
    const result = await Swal.fire({
      icon: "warning",
      title: "Excluir requisição?",
      text: label,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    })
    if (!result.isConfirmed) return
    try {
      await deleteRequisicao(row.id)
      setRequisicoes((prev) => prev.filter((r) => r.id !== row.id))
      await Swal.fire({
        icon: "success",
        title: "Requisição excluída",
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível excluir."
      await Swal.fire({ icon: "error", title: message })
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-56 max-w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-10 w-44 shrink-0 animate-pulse rounded-md bg-gray-200 sm:self-auto" />
        </div>

        <div className="space-y-4 rounded-xl">
          <div className="flex justify-end">
            <div className="h-9 w-full max-w-xs animate-pulse rounded-md border border-transparent bg-gray-200" />
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 min-w-[3rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 last:max-w-[72px] last:flex-none"
                />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border-t border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 min-w-[2.5rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-800 last:max-w-[72px] last:flex-none"
                  />
                ))}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Requisições</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Consulta das requisições registradas no sistema.
          </p>
        </div>
        <Link
          href="/pregoes"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded px-4 py-2 text-sm font-semibold text-white transition bg-custom-blue hover:opacity-90 sm:self-auto"
        >
          <FiPlus className="h-4 w-4 shrink-0" aria-hidden />
          Nova requisição
        </Link>
      </div>

      <RequisicaoTable data={requisicoes} onDelete={handleDelete} />
    </div>
  )
}
