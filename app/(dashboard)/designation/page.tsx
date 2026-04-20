"use client"

import { useCallback, useEffect, useState } from "react"
import { FiPlus } from "react-icons/fi"
import Swal from "sweetalert2"
import { Button } from "@/app/components/ui/button"
import { DesignationFormModal } from "@/app/(dashboard)/designation/components/designation-form-modal"
import { DesignationTable } from "@/app/(dashboard)/designation/components/designation-table"
import {
  deleteDesignation,
  getDesignations,
  type Designation,
} from "@/app/services/designation-service"

type FormModalState = {
  open: boolean
  designationId: string | null
  initialPosition: string
}

const closedFormModal: FormModalState = {
  open: false,
  designationId: null,
  initialPosition: "",
}

export default function DesignationPage() {
  const [designations, setDesignations] = useState<Designation[]>([])
  const [loading, setLoading] = useState(true)
  const [formModal, setFormModal] = useState<FormModalState>(closedFormModal)

  const loadList = useCallback(async () => {
    const res = await getDesignations()
    setDesignations(res.dados ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        await loadList()
      } catch (e) {
        console.error(e)
        if (!cancelled) setDesignations([])
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
    setFormModal({
      open: true,
      designationId: null,
      initialPosition: "",
    })
  }, [])

  const handleEdit = useCallback((row: Designation) => {
    setFormModal({
      open: true,
      designationId: row.id,
      initialPosition: row.position,
    })
  }, [])

  const handleDelete = useCallback(async (row: Designation) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Excluir setor?",
      text: row.position,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    })
    if (!result.isConfirmed) return
    try {
      await deleteDesignation(row.id)
      setDesignations((prev) => prev.filter((d) => d.id !== row.id))
      await Swal.fire({
        icon: "success",
        title: "Setor removido",
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível excluir."
      await Swal.fire({ icon: "error", title: message })
    }
  }, [])

  const handleSaved = useCallback((designation: Designation, isCreate: boolean) => {
    if (isCreate) {
      setDesignations((prev) =>
        [...prev, designation].sort((a, b) =>
          a.position.localeCompare(b.position, "pt-BR")
        )
      )
    } else {
      setDesignations((prev) =>
        prev.map((d) => (d.id === designation.id ? designation : d))
      )
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded-md bg-gray-200 sm:shrink-0" />
        </div>
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="ml-auto h-9 w-full max-w-xs animate-pulse rounded-md bg-gray-200" />
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-t border-zinc-100 px-4 py-3 first:border-t-0"
              >
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Setores</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Designações disponíveis no sistema.
          </p>
        </div>
        <Button
          type="button"
          icon={FiPlus}
          className="self-start sm:self-auto"
          onClick={openCreateModal}
        >
          Novo setor
        </Button>
      </div>

      <DesignationTable
        data={designations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DesignationFormModal
        open={formModal.open}
        onClose={() => setFormModal(closedFormModal)}
        designationId={formModal.designationId}
        initialPosition={formModal.initialPosition}
        onSaved={handleSaved}
      />
    </div>
  )
}
