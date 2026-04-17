import { Suspense } from "react"
import { CriarRequisicaoForm } from "./criar-requisicao-form"

export default function CriarRequisicaoPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-zinc-600">
          Carregando…
        </div>
      }
    >
      <CriarRequisicaoForm />
    </Suspense>
  )
}
