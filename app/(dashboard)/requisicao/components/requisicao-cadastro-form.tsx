"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Swal from "sweetalert2"
import { FileDown, FileText, Loader2, Save } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { Select } from "@/app/components/ui/select"
import { Button } from "@/app/components/ui/button"
import { RequisicaoItensTable } from "@/app/(dashboard)/requisicao/components/requisicao-itens-table"
import {
  getPregaoItens,
  getPregoes,
  type Item,
} from "@/app/services/pregoes-service"
import {
  createRequisicao,
  emitirRequisicaoPdf,
  emitirRequisicaoWord,
  mapLinhasToRequisicaoPayload,
  mapLinhasToUpdateItensPayload,
  partitionLinhasItensParaPayload,
  updateRequisicao,
  type CreateRequisicaoPayload,
  type RequisicaoItemLinha,
  type RequisicaoPorId,
  type UpdateRequisicaoPayload,
} from "@/app/services/requisicao-service"
import {
  getNotasCredito,
  type NotaCredito,
} from "@/app/services/nota-credito-service"
import { useUser } from "@/app/contexts/user-context"

const formSchema = z
  .object({
    data_dia: z.string().min(1, "Dia obrigatório"),
    data_mes: z.string().min(1, "Mês obrigatório"),
    data_ano: z.string().min(1, "Ano obrigatório"),
    numero_diex: z.string().min(1, "Obrigatório"),
    nup: z.string().min(1, "Obrigatório"),
    de: z.string().min(1, "Obrigatório"),
    para: z.string().min(1, "Obrigatório"),
    assunto: z.string().min(1, "Obrigatório"),
    tipo: z.string().min(1, "Obrigatório"),
    ug: z.string().min(1, "Obrigatório"),
    nome_da_ug: z.string().min(1, "Obrigatório"),
    descricao_necessidade: z.string().min(1, "Obrigatório"),
    notaCreditoId: z.string().optional(),
    empenho_tipo: z.enum(["ORDINARIO", "ESTIMATIVO", "GLOBAL"]),
    contrato: z.enum(["sim", "nao"]),
    classe_grupo_pca: z.string().min(1, "Obrigatório"),
    nr_contratacao_pca: z.string().min(1, "Obrigatório"),
  })
  .refine(
    (data) => {
      const d = Number.parseInt(data.data_dia, 10)
      const m = Number.parseInt(data.data_mes, 10)
      const y = Number.parseInt(data.data_ano, 10)
      if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return false
      const dt = new Date(y, m - 1, d)
      return (
        dt.getFullYear() === y &&
        dt.getMonth() === m - 1 &&
        dt.getDate() === d
      )
    },
    { message: "Data inválida", path: ["data_dia"] }
  )

type FormValues = z.infer<typeof formSchema>

function notaCreditoLabel(n: NotaCredito) {
  const emitente = (n.emitente ?? "").trim()
  const nr = (n.numero ?? "").trim()
  const obs = (n.observacao ?? n.descricao ?? "").trim()
  const parts = [emitente, nr, obs].filter(Boolean)
  return parts.length ? parts.join(" - ") : n.id
}

function buildDataIso(values: FormValues): string {
  const d = values.data_dia.padStart(2, "0")
  const m = values.data_mes.padStart(2, "0")
  const y = values.data_ano.padStart(4, "0")
  return `${y}-${m}-${d}`
}

/** `data_req` no PATCH alinhado a DateTime ISO (mesmo padrão do GET). */
function buildDataReqForPatch(values: FormValues): string {
  return `${buildDataIso(values)}T00:00:00.000Z`
}

function parseDataReqParts(data_req: string): {
  dia: string
  mes: string
  ano: string
} {
  const dt = new Date(data_req)
  if (Number.isNaN(dt.getTime())) {
    return { dia: "", mes: "", ano: "" }
  }
  return {
    dia: String(dt.getUTCDate()),
    mes: String(dt.getUTCMonth() + 1),
    ano: String(dt.getUTCFullYear()),
  }
}

function normalizeEmpenhoTipo(
  v: string
): "ORDINARIO" | "ESTIMATIVO" | "GLOBAL" {
  if (v === "ESTIMATIVO" || v === "GLOBAL") return v
  return "ORDINARIO"
}

function triggerBlobDownload(blob: Blob, fallbackName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fallbackName
  a.rel = "noopener"
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type RequisicaoCadastroFormProps = {
  mode: "create" | "edit"
  pregao: string
  ugg: string
  /** Obrigatório em `mode="edit"` */
  requisicaoId?: string
  initialRequisicao?: RequisicaoPorId | null
}

export function RequisicaoCadastroFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="h-8 w-56 rounded-lg bg-gray-200 animate-pulse" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-gray-200 animate-pulse" />
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 animate-pulse">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-md bg-gray-200" />
          </div>
        ))}
        <div className="md:col-span-3 flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-md bg-gray-200" />
        </div>
        <div className="md:col-span-3 flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-28 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-md bg-gray-200" />
        </div>
        <div className="md:col-span-3 flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-40 rounded bg-gray-200" />
          <div className="h-24 w-full rounded-md bg-gray-200" />
        </div>
        <div className="md:col-span-3 animate-pulse">
          <div className="h-3 w-36 rounded bg-gray-200" />
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="h-3 w-12 rounded bg-gray-200" />
                <div className="h-10 rounded-md bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-28 rounded bg-gray-200" />
          <div className="h-10 rounded-md bg-gray-200" />
        </div>
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-10 rounded-md bg-gray-200" />
        </div>
        <div className="flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-32 rounded bg-gray-200" />
          <div className="h-10 rounded-md bg-gray-200" />
        </div>
        <div className="md:col-span-3 flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-md bg-gray-200" />
        </div>
        <div className="md:col-span-3 flex flex-col gap-2 animate-pulse">
          <div className="h-3 w-28 rounded bg-gray-200" />
          <div className="h-10 w-full rounded-md bg-gray-200" />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <div className="h-6 w-52 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-full max-w-xl rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-6 gap-2 border-b border-gray-100 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-4 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-2 border-b border-gray-50 p-3 last:border-0"
            >
              {Array.from({ length: 6 }).map((_, col) => (
                <div key={col} className="h-8 rounded bg-gray-200 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end border-t border-zinc-200 pt-4">
        <div className="h-10 w-44 rounded-md bg-gray-200 animate-pulse" />
      </div>
    </div>
  )
}

export function RequisicaoCadastroForm({
  mode,
  pregao,
  ugg,
  requisicaoId,
  initialRequisicao,
}: RequisicaoCadastroFormProps) {
  const isEdit = mode === "edit"
  const { user, loading: userLoading } = useUser()
  const [itens, setItens] = useState<Item[]>([])
  const [linhasItens, setLinhasItens] = useState<RequisicaoItemLinha[]>([])
  const [itensLoading, setItensLoading] = useState(true)
  const [tipoLoading, setTipoLoading] = useState(!isEdit)
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([])
  const [notasLoading, setNotasLoading] = useState(true)
  const [exportBusy, setExportBusy] = useState<null | "pdf" | "word">(null)

  const paramsOk = Boolean(pregao && ugg)

  useLayoutEffect(() => {
    if (!paramsOk) return
    setItensLoading(true)
    if (isEdit) {
      setTipoLoading(false)
    } else {
      setTipoLoading(true)
    }
  }, [paramsOk, pregao, ugg, isEdit])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_dia: "",
      data_mes: "",
      data_ano: "",
      numero_diex: "",
      nup: "",
      de: "",
      para: "Fiscal Administrativo",
      assunto: "Solicitação de Empenho",
      tipo: "",
      ug: "",
      nome_da_ug: "",
      descricao_necessidade: "",
      notaCreditoId: "",
      empenho_tipo: "ORDINARIO",
      contrato: "nao",
      classe_grupo_pca: "",
      nr_contratacao_pca: "",
    },
  })

  useLayoutEffect(() => {
    if (!isEdit || !initialRequisicao) return
    const r = initialRequisicao
    const parts = parseDataReqParts(r.data_req)
    reset({
      data_dia: parts.dia,
      data_mes: parts.mes,
      data_ano: parts.ano,
      numero_diex: r.numero_diex ?? "",
      nup: r.nup ?? "",
      de: r.de ?? "",
      para: r.para ?? "",
      assunto: r.assunto ?? "",
      tipo: r.tipo ?? "",
      ug: r.ug ?? "",
      nome_da_ug: r.nome_da_ug ?? "",
      descricao_necessidade: r.descricao_necessidade ?? "",
      notaCreditoId: r.notaCreditoId ?? "",
      empenho_tipo: normalizeEmpenhoTipo(r.empenho_tipo),
      contrato: r.contrato === "SIM" ? "sim" : "nao",
      classe_grupo_pca: r.classe_grupo_pca ?? "",
      nr_contratacao_pca: r.nr_contratacao_pca ?? "",
    })
  }, [isEdit, initialRequisicao, reset])

  useEffect(() => {
    if (ugg) {
      setValue("ug", ugg)
    }
  }, [ugg, setValue])

  useEffect(() => {
    if (isEdit) return
    const cargo = user?.designation?.position?.trim()
    if (cargo) {
      setValue("de", cargo)
    }
  }, [user, setValue, isEdit])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!paramsOk) {
        setItensLoading(false)
        return
      }
      setItensLoading(true)
      try {
        const itensRes = await getPregaoItens(pregao, ugg)
        if (cancelled) return
        setItens(itensRes.dados ?? [])
      } catch (e) {
        console.error(e)
        setItens([])
        await Swal.fire({
          icon: "error",
          title: "Não foi possível carregar os itens do pregão.",
        })
      } finally {
        if (!cancelled) setItensLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [paramsOk, pregao, ugg])

  useEffect(() => {
    if (isEdit) return
    let cancelled = false
    async function loadTipo() {
      if (!paramsOk) {
        setTipoLoading(false)
        return
      }
      setTipoLoading(true)
      try {
        const listaRes = await getPregoes()
        if (cancelled) return
        const lista = listaRes.dados ?? []
        const meta = lista.find(
          (p) =>
            p.pregao.trim() === pregao.trim() && p.ugg.trim() === ugg.trim()
        )
        if (meta?.tipoUasg) {
          setValue("tipo", meta.tipoUasg.trim())
        } else {
          await Swal.fire({
            icon: "warning",
            title: "Pregão não encontrado na listagem",
            text: "O tipo (UASG) não pôde ser preenchido automaticamente. Verifique pregão e UGG.",
          })
        }
      } catch (e) {
        console.error(e)
        await Swal.fire({
          icon: "warning",
          title: "Não foi possível carregar o tipo do pregão.",
          text: "Tente recarregar a página.",
        })
      } finally {
        if (!cancelled) setTipoLoading(false)
      }
    }
    void loadTipo()
    return () => {
      cancelled = true
    }
  }, [paramsOk, pregao, ugg, setValue, isEdit])

  useEffect(() => {
    async function loadNotas() {
      setNotasLoading(true)
      try {
        const res = await getNotasCredito()
        setNotasCredito(res.dados ?? [])
      } catch (e) {
        console.error(e)
        setNotasCredito([])
        await Swal.fire({
          icon: "error",
          title: "Não foi possível carregar as notas de crédito.",
        })
      } finally {
        setNotasLoading(false)
      }
    }
    void loadNotas()
  }, [])

  async function onSubmit(values: FormValues) {
    if (!user?.id) {
      await Swal.fire({
        icon: "warning",
        title: "Usuário não carregado. Aguarde ou entre novamente.",
      })
      return
    }
    if (linhasItens.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Não há itens para enviar. Verifique o pregão e a UGG.",
      })
      return
    }

    const { completas: linhasCompletas, parciais: linhasParciais } =
      partitionLinhasItensParaPayload(linhasItens)

    if (linhasParciais.length > 0) {
      const itensLabel = linhasParciais
        .map((l) => l.nrItem.trim() || "—")
        .join(", ")
      await Swal.fire({
        icon: "warning",
        title: "Itens incompletos",
        html: `<p class="text-left text-sm">Se você preencher <strong>subitem</strong>, <strong>UND</strong> ou <strong>quantidade</strong> em uma linha, os três passam a ser obrigatórios para incluir esse item na requisição.</p><p class="mt-2 text-left text-sm">Complete os dados ou apague o que preencheu nas linhas dos itens: <strong>${itensLabel}</strong>.</p>`,
      })
      return
    }

    if (linhasCompletas.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Inclua pelo menos um item",
        text: "Preencha subitem, UND e quantidade (maior que zero) em pelo menos uma linha da tabela. Linhas totalmente em branco são ignoradas.",
      })
      return
    }
    if (
      notasCredito.length > 0 &&
      (!values.notaCreditoId || values.notaCreditoId.trim() === "")
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Selecione uma nota de crédito.",
      })
      return
    }

    const dataIso = buildDataIso(values)
    const notaId = (values.notaCreditoId ?? "").trim()

    if (isEdit) {
      if (!requisicaoId) {
        await Swal.fire({
          icon: "error",
          title: "ID da requisição ausente.",
        })
        return
      }
      const itens = mapLinhasToUpdateItensPayload(linhasCompletas)
      const payload: UpdateRequisicaoPayload = {
        data_req: buildDataReqForPatch(values),
        numero_diex: values.numero_diex,
        nup: values.nup,
        de: values.de,
        para: values.para,
        assunto: values.assunto,
        tipo: values.tipo,
        nr_pregao: pregao,
        ug: values.ug,
        nome_da_ug: values.nome_da_ug,
        descricao_necessidade: values.descricao_necessidade,
        notaCreditoId: notaId || null,
        empenho_tipo: values.empenho_tipo,
        contrato: values.contrato === "sim" ? "SIM" : "NAO",
        classe_grupo_pca: values.classe_grupo_pca,
        nr_contratacao_pca: values.nr_contratacao_pca,
        itens,
      }
      if (process.env.NODE_ENV === "development") {
        console.debug("[updateRequisicao] PATCH /requisicoes/:id payload:", payload)
      }
      try {
        await updateRequisicao(requisicaoId, payload)
        await Swal.fire({
          icon: "success",
          title: "Requisição atualizada",
          text: "Os dados foram salvos.",
          confirmButtonText: "Ok",
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao enviar."
        await Swal.fire({ icon: "error", title: message })
      }
      return
    }

    const detalhes = mapLinhasToRequisicaoPayload(linhasCompletas)
    const payload: CreateRequisicaoPayload = {
      data_req: dataIso,
      numero_diex: values.numero_diex,
      nup: values.nup,
      de: values.de,
      para: values.para,
      assunto: values.assunto,
      tipo: values.tipo,
      nr_pregao: pregao,
      ug: values.ug,
      nome_da_ug: values.nome_da_ug,
      descricao_necessidade: values.descricao_necessidade,
      notaCreditoId: notaId || null,
      empenho_tipo: values.empenho_tipo,
      contrato: values.contrato === "sim" ? "SIM" : "NAO",
      classe_grupo_pca: values.classe_grupo_pca,
      nr_contratacao_pca: values.nr_contratacao_pca,
      userId: user.id,
      detalhes,
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("[createRequisicao] POST /requisicoes payload:", payload)
    }

    try {
      await createRequisicao(payload)
      await Swal.fire({
        icon: "success",
        title: "Requisição cadastrada",
        text: "Os dados foram salvos.",
        confirmButtonText: "Ok",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar."
      await Swal.fire({ icon: "error", title: message })
    }
  }

  if (!paramsOk) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <p className="font-semibold">Dados do pregão ausentes</p>
        <p className="mt-2 text-sm">
          Não foi possível determinar pregão e UGG para carregar os itens.
        </p>
      </div>
    )
  }

  const pageLoading =
    userLoading || itensLoading || notasLoading || tipoLoading

  if (pageLoading) {
    return <RequisicaoCadastroFormSkeleton />
  }

  const titulo = isEdit ? "Editar requisição" : "Nova requisição"
  const submitLabel = isEdit ? "Salvar alterações" : "Salvar requisição"

  async function handleVisualizarPdf() {
    if (!requisicaoId) return
    setExportBusy("pdf")
    try {
      const { blob, filename } = await emitirRequisicaoPdf(requisicaoId)
      triggerBlobDownload(
        blob,
        filename ?? `requisicao-${requisicaoId}.pdf`
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível gerar o PDF."
      await Swal.fire({ icon: "error", title: message })
    } finally {
      setExportBusy(null)
    }
  }

  async function handleVisualizarWord() {
    if (!requisicaoId) return
    setExportBusy("word")
    try {
      const { blob, filename } = await emitirRequisicaoWord(requisicaoId)
      triggerBlobDownload(
        blob,
        filename ?? `requisicao-${requisicaoId}.docx`
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Não foi possível gerar o Word."
      await Swal.fire({ icon: "error", title: message })
    } finally {
      setExportBusy(null)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">{titulo}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Pregão <span className="font-medium">{pregao}</span> · UGG{" "}
            <span className="font-medium">{ugg}</span>
          </p>
          {userLoading ? (
            <p className="mt-2 text-sm text-zinc-500">Carregando usuário…</p>
          ) : !user ? (
            <p className="mt-2 text-sm text-red-600">
              Não foi possível carregar o usuário. Recarregue a página ou entre
              novamente.
            </p>
          ) : null}
        </div>
        {isEdit ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              disabled={!requisicaoId || exportBusy !== null}
              onClick={() => void handleVisualizarPdf()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportBusy === "pdf" ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-red-600"
                  aria-hidden
                />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-red-600" aria-hidden />
              )}
              Visualizar PDF
            </button>
            <button
              type="button"
              disabled={!requisicaoId || exportBusy !== null}
              onClick={() => void handleVisualizarWord()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportBusy === "word" ? (
                <Loader2
                  className="h-4 w-4 shrink-0 animate-spin text-custom-blue"
                  aria-hidden
                />
              ) : (
                <FileDown className="h-4 w-4 shrink-0 text-custom-blue" aria-hidden />
              )}
              Visualizar Word
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 md:grid-cols-3">
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-600 md:col-span-3">
            Verifique os campos obrigatórios.
          </p>
        )}

        <Input label="Número DIEX" {...register("numero_diex")} />
        <Input label="NUP" {...register("nup")} />
        <Input
          label="De"
          readOnly
          title="Preenchido com o posto/função do seu usuário (perfil) ou com os dados salvos"
          {...register("de")}
          className="cursor-not-allowed bg-zinc-50 text-zinc-800"
        />

        <Input label="Para" {...register("para")} />
        <Input
          label="Tipo"
          readOnly
          title="Tipo UASG do pregão (lista de pregões) ou valor salvo na requisição"
          {...register("tipo")}
          className="cursor-not-allowed bg-zinc-50 text-zinc-800"
        />
        <Input
          label="UG"
          readOnly
          title="UGG do pregão (somente leitura)"
          {...register("ug")}
          className="cursor-not-allowed bg-zinc-50 text-zinc-800"
        />

        <div className="md:col-span-3">
          <Input label="Assunto" {...register("assunto")} />
        </div>
        <div className="md:col-span-3">
          <Input label="Nome da UG" {...register("nome_da_ug")} />
        </div>
        <div className="md:col-span-3">
          <Input
            label="Descrição da necessidade"
            {...register("descricao_necessidade")}
          />
        </div>

        <div className="md:col-span-3">
          <p className="text-sm text-gray-text mb-1">Data da Requisição</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="Dia"
              type="number"
              min={1}
              max={31}
              placeholder="DD"
              {...register("data_dia")}
            />
            <Input
              label="Mês"
              type="number"
              min={1}
              max={12}
              placeholder="MM"
              {...register("data_mes")}
            />
            <Input
              label="Ano"
              type="number"
              min={2000}
              max={2100}
              placeholder="AAAA"
              {...register("data_ano")}
            />
          </div>
        </div>

        <Select label="Empenho (tipo)" {...register("empenho_tipo")}>
          <option value="ORDINARIO">Ordinário</option>
          <option value="ESTIMATIVO">Estimativo</option>
          <option value="GLOBAL">Global</option>
        </Select>

        <Select label="Contrato" {...register("contrato")}>
          <option value="nao">Não</option>
          <option value="sim">Sim</option>
        </Select>

        <Input label="Classe / grupo PCA" {...register("classe_grupo_pca")} />

        <div className="md:col-span-3">
          <Input
            label="Nº contratação PCA"
            {...register("nr_contratacao_pca")}
          />
        </div>

        <div className="md:col-span-3 flex flex-col gap-2">
          {notasLoading ? (
            <p className="text-sm text-zinc-500">Carregando notas de crédito…</p>
          ) : notasCredito.length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Não há nota de crédito disponível no momento.
            </p>
          ) : null}
          <Select
            label="Nota de crédito"
            disabled={notasLoading || notasCredito.length === 0}
            {...register("notaCreditoId")}
          >
            <option value="">
              {notasCredito.length === 0
                ? "—"
                : "Selecione uma nota de crédito"}
            </option>
            {notasCredito.map((n) => (
              <option key={n.id} value={n.id}>
                {notaCreditoLabel(n)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Itens da requisição
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Ajuste subitem, unidade e quantidade por linha. A quantidade não
            ultrapassa o saldo do pregão.
          </p>
        </div>
        <RequisicaoItensTable
          loading={itensLoading}
          items={itens}
          onLinhasChange={setLinhasItens}
          detalhesSalvos={
            isEdit && initialRequisicao?.detalhes
              ? initialRequisicao.detalhes
              : null
          }
        />
      </section>

      <div className="flex justify-end border-t border-zinc-200 pt-4">
        <Button type="submit" loading={isSubmitting} icon={Save}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
