"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, X } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Modal, ModalBody, ModalFooter } from "@/app/components/ui/modal"
import { NotaCreditoFormSkeleton } from "./nota-credito-form-skeleton"
import {
  createNotaCredito,
  getNotaCreditoById,
  updateNotaCredito,
  type CreateNotaCreditoPayload,
  type NotaCredito,
} from "@/app/services/nota-credito-service"

const MIN_FORM_SKELETON_MS = 240

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

const requiredTrim = (label: string) =>
  z.string().refine((val) => val.trim().length > 0, {
    message: `${label} é obrigatório`,
  })

const formSchema = z.object({
  numero: requiredTrim("Número"),
  emitente: requiredTrim("Emitente"),
  favorecido: requiredTrim("Favorecido"),
  observacao: requiredTrim("Observação"),
  prazo: z
    .string()
    .min(1, "Prazo é obrigatório")
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Data inválida",
    }),
  valor: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine((val) => {
      const n = Number(val.replace(",", "."))
      return !Number.isNaN(n) && n > 0
    }, {
      message: "Informe um valor maior que zero",
    }),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  numero: "",
  emitente: "",
  favorecido: "",
  observacao: "",
  prazo: "",
  valor: "",
}

function isoToDateInput(iso: string | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function buildPayload(values: FormValues): CreateNotaCreditoPayload {
  const valor = Number(values.valor.replace(",", "."))
  return {
    numero: values.numero.trim(),
    emitente: values.emitente.trim(),
    favorecido: values.favorecido.trim(),
    observacao: values.observacao.trim(),
    prazo: `${values.prazo}T00:00:00.000Z`,
    valor,
  }
}

export interface NotaCreditoFormModalProps {
  open: boolean
  onClose: () => void
  notaCreditoId: string | null
  onSaved: (nota: NotaCredito, isCreate: boolean) => void
}

export function NotaCreditoFormModal({
  open,
  onClose,
  notaCreditoId,
  onSaved,
}: NotaCreditoFormModalProps) {
  const isEdit = Boolean(notaCreditoId)
  const [formSkeleton, setFormSkeleton] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) {
      setFormSkeleton(false)
      return
    }

    let cancelled = false

    async function load() {
      setFormSkeleton(true)

      if (!notaCreditoId) {
        reset(emptyValues)
        await delay(MIN_FORM_SKELETON_MS)
        if (!cancelled) setFormSkeleton(false)
        return
      }

      const started = Date.now()
      try {
        const res = await getNotaCreditoById(notaCreditoId)
        const n = res.dados
        if (cancelled || !n) return
        reset({
          numero: (n.numero ?? "").trim(),
          emitente: (n.emitente ?? "").trim(),
          favorecido: (n.favorecido ?? "").trim(),
          observacao: (
            n.observacao ??
            n.descricao ??
            ""
          ).trim(),
          prazo: isoToDateInput(n.prazo),
          valor: n.valor != null && !Number.isNaN(n.valor) ? String(n.valor) : "",
        })
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar a nota."
        await Swal.fire({ icon: "error", title: message })
        if (!cancelled) onClose()
      } finally {
        if (!cancelled) {
          const elapsed = Date.now() - started
          await delay(Math.max(0, MIN_FORM_SKELETON_MS - elapsed))
          if (!cancelled) setFormSkeleton(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, notaCreditoId, reset, onClose])

  async function onSubmit(values: FormValues) {
    const payload = buildPayload(values)
    try {
      let saved: NotaCredito | undefined
      if (notaCreditoId) {
        const res = await updateNotaCredito(notaCreditoId, payload)
        saved = res.dados
      } else {
        const res = await createNotaCredito(payload)
        saved = res.dados
      }
      if (!saved) {
        await Swal.fire({
          icon: "error",
          title: "Resposta inválida do servidor.",
        })
        return
      }
      onSaved(saved, !notaCreditoId)
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Nota de crédito atualizada" : "Nota de crédito cadastrada",
      })
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar."
      await Swal.fire({ icon: "error", title: message })
    }
  }

  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-3 pb-2">
          <h2 className="pr-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            {isEdit ? "Editar nota de crédito" : "Nova nota de crédito"}
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

        <ModalBody className="space-y-4">
          {formSkeleton ? (
            <NotaCreditoFormSkeleton />
          ) : (
            <>
              <div>
                <Input
                  label="Número"
                  placeholder="Ex.: 2026NC000123"
                  autoComplete="off"
                  {...register("numero")}
                />
                {errors.numero && (
                  <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Emitente"
                  placeholder="Ex.: 160001 - Base Central"
                  autoComplete="off"
                  {...register("emitente")}
                />
                {errors.emitente && (
                  <p className="mt-1 text-sm text-red-600">{errors.emitente.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Favorecido"
                  placeholder="Ex.: BCMS"
                  autoComplete="off"
                  {...register("favorecido")}
                />
                {errors.favorecido && (
                  <p className="mt-1 text-sm text-red-600">{errors.favorecido.message}</p>
                )}
              </div>

              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-text">Observação</label>
                  <textarea
                    rows={3}
                    autoComplete="off"
                    placeholder="Descreva o motivo ou uso do crédito"
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-text outline-none"
                    {...register("observacao")}
                  />
                </div>
                {errors.observacao && (
                  <p className="mt-1 text-sm text-red-600">{errors.observacao.message}</p>
                )}
              </div>

              <div>
                <Input label="Prazo" type="date" {...register("prazo")} />
                {errors.prazo && (
                  <p className="mt-1 text-sm text-red-600">{errors.prazo.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0,00"
                  {...register("valor")}
                />
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
                )}
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          {formSkeleton ? (
            <div
              className="h-10 w-40 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700"
              aria-hidden
            />
          ) : (
            <Button type="submit" loading={isSubmitting} icon={Save}>
              {isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  )
}
