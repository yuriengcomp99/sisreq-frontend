"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import Swal from "sweetalert2"
import { Input } from "@/app/components/ui/input"
import { Select } from "@/app/components/ui/select"
import { Button } from "@/app/components/ui/button"
import { useUser } from "@/app/contexts/user-context"
import { GRADUATION_OPTIONS } from "@/app/lib/graduation-options"
import { updateProfile, type UpdateProfilePayload } from "@/app/services/auth-service"

const requiredTrim = (label: string) =>
  z.string().refine((val) => val.trim().length > 0, {
    message: `${label} é obrigatório`,
  })

const graduationField = z
  .string()
  .min(1, "Selecione o posto / graduação")
  .refine(
    (v) => (GRADUATION_OPTIONS as readonly string[]).includes(v.trim()),
    { message: "Selecione um posto / graduação válido" }
  )

const profileSchema = z
  .object({
    first_name: requiredTrim("Nome"),
    army_name: requiredTrim("Nome de guerra"),
    graduation: graduationField,
    email: z.string().email("E-mail inválido"),
    password: z.string(),
    passwordConfirm: z.string(),
  })
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
      return
    }
    if (p !== c) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["passwordConfirm"],
      })
    }
  })

type ProfileFormValues = z.infer<typeof profileSchema>

function roleLabel(role: string | undefined): string {
  const r = (role ?? "").toUpperCase()
  if (r === "ADMIN") return "Administrador"
  if (r === "USER") return "Usuário"
  return role?.trim() || "—"
}

export default function ProfilePage() {
  const { user, loading, error, refresh } = useUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      army_name: "",
      graduation: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  })

  useEffect(() => {
    if (!user) return
    const g = user.graduation?.trim() ?? ""
    const graduation = (GRADUATION_OPTIONS as readonly string[]).includes(g)
      ? g
      : ""
    reset({
      first_name: user.first_name?.trim() ?? "",
      army_name: user.army_name?.trim() ?? "",
      graduation,
      email: user.email?.trim() ?? "",
      password: "",
      passwordConfirm: "",
    })
  }, [user, reset])

  async function onSubmit(values: ProfileFormValues) {
    const payload: UpdateProfilePayload = {
      first_name: values.first_name.trim(),
      army_name: values.army_name.trim(),
      graduation: values.graduation.trim(),
      email: values.email.trim(),
    }
    const pw = values.password.trim()
    if (pw.length > 0) {
      payload.password = pw
    }
    try {
      await updateProfile(payload)
      await refresh()
      await Swal.fire({
        icon: "success",
        title: "Perfil atualizado",
        text: "Os dados foram salvos.",
        confirmButtonText: "Ok",
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar o perfil."
      await Swal.fire({ icon: "error", title: message })
    }
  }

  if (loading && !user) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-100" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-semibold">Não foi possível carregar o perfil</p>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Meu perfil</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Atualize seus dados pessoais. Perfil e função são definidos pelo
          administrador.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-none flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        {user ? (
          <div className="grid gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 text-sm text-zinc-700 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Perfil (somente leitura)
              </p>
              <p className="mt-1 font-medium text-zinc-900">{roleLabel(user.role)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Função / setor (somente leitura)
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {user.designation?.position?.trim() || "—"}
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <Select label="Posto / graduação" {...register("graduation")}>
            <option value="">Selecione…</option>
            {GRADUATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
          {errors.graduation && (
            <p className="mt-1 text-sm text-red-600">{errors.graduation.message}</p>
          )}
        </div>

        <div>
          <Input label="Nome" autoComplete="given-name" {...register("first_name")} />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Nome de guerra"
            autoComplete="nickname"
            {...register("army_name")}
          />
          {errors.army_name && (
            <p className="mt-1 text-sm text-red-600">{errors.army_name.message}</p>
          )}
        </div>

        <div>
          <Input label="E-mail" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <p className="mb-3 text-sm text-zinc-600">
            Nova senha (opcional). Deixe em branco para manter a senha atual.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div className="flex-1">
              <Input
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                {...register("passwordConfirm")}
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <Button type="submit" loading={isSubmitting} icon={Save} disabled={!user}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
