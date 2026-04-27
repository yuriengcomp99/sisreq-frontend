"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  RequisicaoCadastroForm,
  RequisicaoCadastroFormSkeleton,
} from "@/app/(dashboard)/requisicao/components/requisicao-cadastro-form"
import {
  getRequisicaoById,
  type RequisicaoPorId,
} from "@/app/services/requisicao-service"

export function EditarRequisicaoClient({ requisicaoId }: { requisicaoId: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RequisicaoPorId | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getRequisicaoById(requisicaoId)
        if (cancelled) return
        setData(res.dados ?? null)
        if (!res.dados) {
          setError("Requisição não encontrada.")
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setData(null)
          setError(
            e instanceof Error ? e.message : "Não foi possível carregar a requisição."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [requisicaoId])

  if (loading) {
    return <RequisicaoCadastroFormSkeleton />
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <p className="font-semibold">Não foi possível abrir a edição</p>
        <p className="mt-2 text-sm">{error ?? "Requisição não encontrada."}</p>
        <Link
          href="/requisicao"
          className="mt-4 inline-block text-sm font-semibold text-custom-blue underline"
        >
          Voltar para a lista
        </Link>
      </div>
    )
  }

  const pregao = data.nr_pregao?.trim() ?? ""
  const ugg = data.ug?.trim() ?? ""

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/requisicao"
        className="text-sm font-medium text-custom-blue hover:underline w-fit"
      >
        ← Voltar para requisições
      </Link>
      <RequisicaoCadastroForm
        mode="edit"
        requisicaoId={requisicaoId}
        pregao={pregao}
        ugg={ugg}
        initialRequisicao={data}
      />
    </div>
  )
}
