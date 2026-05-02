"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, X } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Modal, ModalBody, ModalFooter } from "@/app/components/ui/modal"
import { UserAdminFormSkeleton } from "./user-admin-form-skeleton"
import {
  createAdminUser,
  getAdminUserById,
  updateAdminUser,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from "@/app/services/admin-users-service"
import type { User } from "@/app/services/auth-service"
import { getDesignations, type Designation } from "@/app/services/designation-service"
import {
  GRADUATION_OPTIONS,
  normalizeGraduation,
} from "@/app/lib/graduation-options"

const MIN_FORM_SKELETON_MS = 240

const OM_FIXO = "BCMS" as const

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

const requiredTrim = (label: string) =>
  z.string().refine((val) => val.trim().length > 0, {
    message: `${label} é obrigatório`,
  })

const graduationField = z
  .string()
  .min(1, "Selecione a graduação")
  .refine(
    (v) => (GRADUATION_OPTIONS as readonly string[]).includes(v.trim()),
    { message: "Selecione uma graduação válida" }
  )

const baseFields = {
  first_name: requiredTrim("Nome"),
  army_name: requiredTrim("Nome de guerra"),
  graduation: graduationField,
  email: z.string().email("E-mail inválido"),
  role: z.enum(["ADMIN", "USER"]),
  om: z.literal(OM_FIXO),
  designationId: z.string().min(1, "Selecione a função"),
  password: z.string(),
  passwordConfirm: z.string(),
}

const createUserFormSchema = z
  .object(baseFields)
  .superRefine((data, ctx) => {
    if (data.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Senha deve ter no mínimo 6 caracteres",
        path: ["password"],
      })
    }
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["passwordConfirm"],
      })
    }
  })

const editUserFormSchema = z
  .object(baseFields)
  .superRefine((data, ctx) => {
    const p = data.password
    const c = data.passwordConfirm
    if (p.length === 0 && c.length === 0) return
    if (p.length === 0 && c.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a nova senha",
        path: ["password"],
      })
      return
    }
    if (p.length > 0 && c.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Confirme a nova senha",
        path: ["passwordConfirm"],
      })
      return
    }
    if (p.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Senha deve ter no mínimo 6 caracteres",
        path: ["password"],
      })
    }
    if (p !== c) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["passwordConfirm"],
      })
    }
  })

type FormValues = z.infer<typeof createUserFormSchema>

function emptyValues(): FormValues {
  return {
    first_name: "",
    army_name: "",
    graduation: "",
    email: "",
    role: "USER",
    om: OM_FIXO,
    designationId: "",
    password: "",
    passwordConfirm: "",
  }
}

function normalizeRole(role: string | undefined): "ADMIN" | "USER" {
  const u = (role ?? "USER").toUpperCase()
  return u === "ADMIN" ? "ADMIN" : "USER"
}

function valuesFromUser(u: User): FormValues {
  return {
    first_name: (u.first_name ?? "").trim(),
    army_name: (u.army_name ?? "").trim(),
    graduation: normalizeGraduation(u.graduation),
    email: (u.email ?? "").trim(),
    role: normalizeRole(u.role),
    om: OM_FIXO,
    designationId: u.designation?.id ?? "",
    password: "",
    passwordConfirm: "",
  }
}

function buildCreatePayload(values: FormValues): CreateAdminUserPayload {
  return {
    email: values.email.trim(),
    password: values.password,
    first_name: values.first_name.trim(),
    army_name: values.army_name.trim(),
    graduation: values.graduation.trim(),
    role: values.role,
    om: OM_FIXO,
    designationId: values.designationId,
  }
}

function buildUpdatePayload(values: FormValues): UpdateAdminUserPayload {
  const body: UpdateAdminUserPayload = {
    email: values.email.trim(),
    first_name: values.first_name.trim(),
    army_name: values.army_name.trim(),
    graduation: values.graduation.trim(),
    role: values.role,
    om: OM_FIXO,
    designationId: values.designationId,
  }
  if (values.password.trim().length > 0) {
    body.password = values.password.trim()
  }
  return body
}

const selectClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-text outline-none dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200"

export interface UserAdminFormModalProps {
  open: boolean
  onClose: () => void
  userId: string | null
  onSaved: (user: User, isCreate: boolean) => void
}

function UserAdminFormModalInner({
  userId,
  onClose,
  onSaved,
}: Omit<UserAdminFormModalProps, "open">) {
  const isEdit = Boolean(userId)
  const [formSkeleton, setFormSkeleton] = useState(false)
  const [designations, setDesignations] = useState<Designation[]>([])

  const schema = useMemo(
    () => (isEdit ? editUserFormSchema : createUserFormSchema),
    [isEdit]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(),
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setFormSkeleton(true)
      const started = Date.now()

      try {
        const [desRes] = await Promise.all([getDesignations()])
        if (cancelled) return
        setDesignations(desRes.dados ?? [])
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar as funções."
        await Swal.fire({ icon: "error", title: message })
        if (!cancelled) onClose()
        return
      }

      if (!userId) {
        reset(emptyValues())
        const elapsed = Date.now() - started
        await delay(Math.max(0, MIN_FORM_SKELETON_MS - elapsed))
        if (!cancelled) setFormSkeleton(false)
        return
      }

      try {
        const res = await getAdminUserById(userId)
        const u = res.dados
        if (cancelled || !u) return
        reset(valuesFromUser(u))
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Não foi possível carregar o usuário."
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
  }, [userId, reset, onClose])

  async function onSubmit(values: FormValues) {
    try {
      let saved: User | undefined
      if (userId) {
        const res = await updateAdminUser(userId, buildUpdatePayload(values))
        saved = res.dados
      } else {
        const res = await createAdminUser(buildCreatePayload(values))
        saved = res.dados
      }
      if (!saved) {
        await Swal.fire({
          icon: "error",
          title: "Resposta inválida do servidor.",
        })
        return
      }
      onSaved(saved, !userId)
      await Swal.fire({
        icon: "success",
        title: isEdit ? "Usuário atualizado" : "Usuário cadastrado",
      })
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar."
      await Swal.fire({ icon: "error", title: message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-start justify-between gap-3 pb-2">
          <h2 className="pr-2 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            {isEdit ? "Editar usuário" : "Novo usuário"}
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
            <UserAdminFormSkeleton />
          ) : (
            <>
              <div>
                <Input
                  label="Nome"
                  placeholder="Nome completo"
                  autoComplete="name"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Nome de guerra"
                  placeholder="Ex.: SILVA"
                  autoComplete="off"
                  {...register("army_name")}
                />
                {errors.army_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.army_name.message}</p>
                )}
              </div>

              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-text">Graduação</label>
                  <select className={selectClass} {...register("graduation")}>
                    <option value="">Selecione…</option>
                    {GRADUATION_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.graduation && (
                  <p className="mt-1 text-sm text-red-600">{errors.graduation.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="email@exemplo.mil.br"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-text">Perfil</label>
                    <select className={selectClass} {...register("role")}>
                      <option value="USER">Usuário</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="OM"
                    readOnly
                    title="OM fixo para este sistema"
                    autoComplete="off"
                    className="cursor-not-allowed bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    {...register("om")}
                  />
                  {errors.om && (
                    <p className="mt-1 text-sm text-red-600">{errors.om.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-text">Função (setor)</label>
                  <select className={selectClass} {...register("designationId")}>
                    <option value="">Selecione…</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.position}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.designationId && (
                  <p className="mt-1 text-sm text-red-600">{errors.designationId.message}</p>
                )}
              </div>

              <div>
                <Input
                  label={isEdit ? "Nova senha" : "Senha"}
                  type="password"
                  autoComplete={isEdit ? "new-password" : "new-password"}
                  placeholder={isEdit ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                  {...register("password")}
                />
                {isEdit && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Deixe em branco para manter a senha atual.
                  </p>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Confirmar senha"
                  type="password"
                  autoComplete="new-password"
                  placeholder={isEdit ? "Repita a nova senha" : "Repita a senha"}
                  {...register("passwordConfirm")}
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
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
  )
}

export function UserAdminFormModal({
  open,
  onClose,
  userId,
  onSaved,
}: UserAdminFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-xl">
      {open ? (
        <UserAdminFormModalInner
          key={userId === null ? "create" : userId}
          userId={userId}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  )
}
