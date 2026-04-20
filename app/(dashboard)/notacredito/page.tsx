"use client"

import { useCallback, useEffect, useState } from "react"
import { FiPlus } from "react-icons/fi"
import Swal from "sweetalert2"
import { NotaCreditoFormModal } from "@/app/(dashboard)/notacredito/components/nota-credito-form-modal"
import { NotaCreditoTable } from "@/app/(dashboard)/notacredito/components/nota-credito-table"
import { Button } from "@/app/components/ui/button"
import {
  deleteNotaCredito,
  getNotasCredito,
  type NotaCredito,
} from "@/app/services/nota-credito-service"

type FormModalState = {
  open: boolean
  notaCreditoId: string | null
}

const closedFormModal: FormModalState = {
  open: false,
  notaCreditoId: null,
}

export default function NotaCreditoPage() {
  const [notas, setNotas] = useState<NotaCredito[]>([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState<FormModalState>(closedFormModal)

  const loadList = useCallback(async () => {
    const res = await getNotasCredito()
    setNotas(res.dados ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await loadList()
      } catch (e) {
        console.error(e)
        if (!cancelled) setNotas([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadList])

  const openCreateModal = useCallback(() => {
    setFormModal({ open: true, notaCreditoId: null })
  }, [])

  const handleEdit = useCallback((row: NotaCredito) => {
    setFormModal({ open: true, notaCreditoId: row.id })
  }, [])

  const handleDelete = useCallback(async (row: NotaCredito) => {
    const label = (row.numero ?? row.id).trim() || row.id
    const result = await Swal.fire({
      icon: "warning",
      title: "Excluir nota de crédito?",
      text: label,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    })
    if (!result.isConfirmed) return
    try {
      await deleteNotaCredito(row.id)
      setNotas((prev) => prev.filter((n) => n.id !== row.id))
      await Swal.fire({
        icon: "success",
        title: "Nota de crédito removida",
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível excluir."
      await Swal.fire({ icon: "error", title: message })
    }
  }, [])

  const handleSaved = useCallback((nota: NotaCredito, isCreate: boolean) => {
    if (isCreate) {
      setNotas((prev) =>
        [...prev, nota].sort((a, b) =>
          (a.numero ?? a.id).localeCompare(b.numero ?? b.id, "pt-BR")
        )
      )
    } else {
      setNotas((prev) => prev.map((n) => (n.id === nota.id ? nota : n)))
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-10 w-48 animate-pulse rounded-md bg-gray-200 sm:shrink-0" />
        </div>
        <div className="space-y-4 rounded-xl">
          <div className="flex justify-end">
            <div className="h-9 w-full max-w-xs animate-pulse rounded-md border border-transparent bg-gray-200" />
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3.5 min-w-[4rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 first:max-w-[100px] last:max-w-[80px] last:flex-none"
                />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-t border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {Array.from({ length: 7 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 min-w-[3rem] flex-1 animate-pulse rounded bg-gray-200 dark:bg-zinc-800 first:max-w-[100px] last:max-w-[72px] last:flex-none"
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
          <h1 className="text-2xl font-bold text-zinc-900">
            Notas de crédito
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Cadastro e consulta das notas de crédito do sistema.
          </p>
        </div>
        <Button
          type="button"
          icon={FiPlus}
          className="self-start sm:self-auto"
          onClick={openCreateModal}
        >
          Nova nota de crédito
        </Button>
      </div>

      <NotaCreditoTable
        data={notas}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <NotaCreditoFormModal
        open={formModal.open}
        onClose={() => setFormModal(closedFormModal)}
        notaCreditoId={formModal.notaCreditoId}
        onSaved={handleSaved}
      />
    </div>
  )
}
