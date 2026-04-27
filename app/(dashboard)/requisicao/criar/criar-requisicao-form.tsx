"use client"

import { useSearchParams } from "next/navigation"
import { RequisicaoCadastroForm } from "@/app/(dashboard)/requisicao/components/requisicao-cadastro-form"

export function CriarRequisicaoForm() {
  const searchParams = useSearchParams()
  const pregao = searchParams.get("pregao")?.trim() ?? ""
  const ugg = searchParams.get("ugg")?.trim() ?? ""

  const paramsOk = Boolean(pregao && ugg)

  if (!paramsOk) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-semibold">Parâmetros ausentes</p>
        <p className="mt-2 text-sm">
          Abra esta página a partir da lista de pregões (botão &quot;Gerar
          Requisição&quot;) ou informe{" "}
          <code className="rounded bg-amber-100 px-1">pregao</code> e{" "}
          <code className="rounded bg-amber-100 px-1">ugg</code> na URL.
        </p>
      </div>
    )
  }

  return <RequisicaoCadastroForm mode="create" pregao={pregao} ugg={ugg} />
}
