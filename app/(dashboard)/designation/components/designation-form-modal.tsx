"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, X } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Modal, ModalBody, ModalFooter } from "@/app/components/ui/modal"
import {
  createDesignation,
  updateDesignation,
  type Designation,
} from "@/app/services/designation-service"

const formSchema = z.object({
  position: z.string().refine((val) => val.trim().length > 0, {
    message: "Campo obrigatório",
  }),
})

type FormValues = z.infer<typeof formSchema>

export interface DesignationFormModalProps {
  open: boolean
  onClose: () => void
  designationId: string | null
  initialPosition?: string
  onSaved: (designation: Designation, isCreate: boolean) => void
}

export function DesignationFormModal({
  open,
  onClose,
  designationId,
  initialPosition = "",
  onSaved,
}: DesignationFormModalProps) {
  const isEdit = Boolean(designationId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { position: "" },
  })

  useEffect(() => {
    if (!open) return
    reset({ position: initialPosition ?? "" })
  }, [open, designationId, initialPosition, reset])

  async function onSubmit(values: FormValues) {
    const position = values.position.trim()
    try {
      let saved: Designation | undefined
      if (designationId) {
        const res = await updateDesignation(designationId, { position })
        saved = res.dados
      } else {
        const res = await createDesignation({ position })
        saved = res.dados
      }
      if (!saved) {
        await Swal.fire({
          icon: "error",
          title: "Resposta inválida do servidor.",
        })
        return
      }
      onSaved(saved, !designationId)
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Setor atualizado" : "Setor cadastrado",
      })
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar."
      await Swal.fire({ icon: "error", title: message })
    }
  }

  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-3 pb-2">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 pr-2">
            {isEdit ? "Editar setor" : "Novo setor"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="
              shrink-0 rounded-md p-2
              text-zinc-500 transition
              hover:bg-zinc-100 hover:text-zinc-700
              dark:hover:bg-zinc-800
            "
          >
            <X size={18} />
          </button>
        </div>

        <ModalBody>
          <Input
            label="Setor"
            placeholder="Ex.: Fiscal Administrativo"
            autoComplete="off"
            {...register("position")}
          />
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="submit" loading={isSubmitting} icon={Save}>
            {isEdit ? "Salvar" : "Cadastrar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
