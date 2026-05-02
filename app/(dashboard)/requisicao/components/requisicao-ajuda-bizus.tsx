"use client"

import { ExternalLink, FileText, Sparkles } from "lucide-react"

/** PCA no PNCP — referência para preencher “Classe / grupo PCA”. */
export const PCA_PNCP_URL =
  "https://pncp.gov.br/app/pca/00394452000103/2026/388" as const

/** PDFs em `/public` — referência para preencher subitem nos itens. */
export const SUBITEM_REFERENCIA_PDFS = [
  {
    href: "/449052.pdf",
    title: "Referência 449052",
    subtitle: "Material de apoio",
  },
  {
    href: "/339030.pdf",
    title: "Referência 339030",
    subtitle: "Material de apoio",
  },
  {
    href: "/339039.pdf",
    title: "Referência 339039",
    subtitle: "Material de apoio",
  },
] as const

/** Abre o PCA no PNCP — mesma altura visual do `Input` (campo com label acima na página). */
export function PncpPcaBizuButton() {
  return (
    <a
      href={PCA_PNCP_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Abre o PCA no portal PNCP (nova aba)"
      className="inline-flex h-10 w-full min-w-0 cursor-pointer items-center justify-center gap-2 rounded border border-custom-blue/40 bg-white px-3 text-sm font-semibold text-custom-blue shadow-sm transition hover:border-custom-blue hover:bg-sky-50/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-custom-blue"
    >
      <ExternalLink className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
      <span className="truncate">PCA no PNCP</span>
    </a>
  )
}

/** Faixa de ajuda com os 3 PDFs para preenchimento do subitem. */
export function SubitemReferenciasBizuPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/80 shadow-sm ring-1 ring-violet-100/80">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-700">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900">
              Bizu para o campo <span className="text-violet-700">Subitem</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 sm:text-sm">
              Os códigos de subitem seguem tabelas dos editais. Abra um PDF ao
              lado da tabela, confira o padrão e preencha cada linha.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 border-t border-violet-100/90 bg-white/60 px-4 py-3 sm:grid-cols-3 sm:px-5 sm:py-4">
        {SUBITEM_REFERENCIA_PDFS.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-zinc-200/90 bg-white px-3 py-3 shadow-sm transition hover:border-violet-300 hover:bg-violet-50/50 hover:shadow"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition group-hover:bg-violet-100 group-hover:text-violet-700">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-semibold text-zinc-800 group-hover:text-violet-900">
                {doc.title}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-custom-blue">
                Abrir PDF
                <ExternalLink className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
