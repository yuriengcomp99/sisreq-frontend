"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  Package,
  Sparkles,
} from "lucide-react"
import { formatCurrency, formatNumber } from "@/app/lib/format"
import {
  getDashboardSummary,
  type DashboardMetrics,
} from "@/app/services/dashboard-service"

function todayLabel() {
  const now = new Date()
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" })
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const datePart = now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return { capitalized, datePart, time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-full max-w-[12rem] animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

type MetricCardProps = {
  title: string
  value: string
  hint: string
  icon: ReactNode
  accentClass: string
  iconWrapClass: string
}

function MetricCard({ title, value, hint, icon, accentClass, iconWrapClass }: MetricCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm
        transition duration-300 hover:-translate-y-0.5 hover:shadow-md
        dark:bg-zinc-950
        ${accentClass}
      `}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.12] transition group-hover:opacity-20"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{hint}</p>
        </div>
        <div
          className={`
            flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-inner
            ${iconWrapClass}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

const emptyMetrics: DashboardMetrics = {
  totalRequisicoes: 0,
  totalItensComSaldoDisponivel: 0,
  totalLicitacoes: 0,
  creditoDisponivelReais: 0,
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await getDashboardSummary()
      setMetrics(res.dados ?? emptyMetrics)
    } catch (e) {
      console.error(e)
      setMetrics(emptyMetrics)
      setError(e instanceof Error ? e.message : "Não foi possível carregar as métricas.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const dateDisplay = todayLabel()

  return (
    <div className="flex flex-col gap-8">
      <div
        className="
          relative overflow-hidden rounded-2xl bg-custom-blue px-6 py-8 text-white shadow-lg
          sm:px-10 sm:py-10
        "
      >
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Sistema integrado de requisições
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Bem-vindo ao SISREQ
            </h1>
            <p className="text-sm leading-relaxed text-white/90 sm:text-base">
              Acompanhe requisições, saldo de itens de ata, licitações e crédito disponível em um
              só lugar. Use o menu para registrar pregões, notas de crédito e novas requisições.
            </p>
          </div>
          <div
            className="
              flex shrink-0 flex-col gap-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-4
              text-left backdrop-blur-md sm:min-w-[240px]
            "
          >
            <div className="flex items-center gap-2 text-white/80">
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider">Hoje</span>
            </div>
            <p className="text-lg font-semibold capitalize leading-snug">{dateDisplay.capitalized}</p>
            <p className="text-sm text-white/90">{dateDisplay.datePart}</p>
            <p className="text-xs tabular-nums text-white/70">{dateDisplay.time}</p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Requisições"
              value={formatNumber(metrics.totalRequisicoes)}
              hint="Total de requisições registradas no sistema."
              icon={<ClipboardList className="h-6 w-6" aria-hidden />}
              accentClass="border-sky-200/80 hover:border-sky-300 dark:border-sky-900/40"
              iconWrapClass="bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/30"
            />
            <MetricCard
              title="Itens com saldo"
              value={formatNumber(metrics.totalItensComSaldoDisponivel)}
              hint="Linhas de ata ainda com quantidade disponível."
              icon={<Package className="h-6 w-6" aria-hidden />}
              accentClass="border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-900/40"
              iconWrapClass="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
            />
            <MetricCard
              title="Licitações"
              value={formatNumber(metrics.totalLicitacoes)}
              hint="Combinações distintas de pregão e UGG."
              icon={<Building2 className="h-6 w-6" aria-hidden />}
              accentClass="border-amber-200/80 hover:border-amber-300 dark:border-amber-900/40"
              iconWrapClass="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
            />
            <MetricCard
              title="Crédito disponível"
              value={formatCurrency(metrics.creditoDisponivelReais)}
              hint="Valor em notas de crédito ainda não consumido."
              icon={<Coins className="h-6 w-6" aria-hidden />}
              accentClass="border-violet-200/80 hover:border-violet-300 dark:border-violet-900/40"
              iconWrapClass="bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30"
            />
          </>
        )}
      </div>
    </div>
  )
}
