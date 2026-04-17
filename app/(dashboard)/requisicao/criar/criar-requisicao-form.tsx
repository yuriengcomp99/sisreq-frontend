"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Swal from "sweetalert2"
import { Save } from "lucide-react"
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
  mapLinhasToRequisicaoPayload,
  type CreateRequisicaoPayload,
  type RequisicaoItemLinha,
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

function CriarRequisicaoFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="h-8 w-56 rounded-lg bg-gray-200 animate-pulse" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-gray-200 animate-pulse" />
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 animate-pulse"
          >
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
              <div
                key={index}
                className="h-4 rounded bg-gray-200 animate-pulse"
              />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-6 gap-2 border-b border-gray-50 p-3 last:border-0"
            >
              {Array.from({ length: 6 }).map((_, col) => (
                <div
                  key={col}
                  className="h-8 rounded bg-gray-200 animate-pulse"
                />
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

export function CriarRequisicaoForm() {
  const searchParams = useSearchParams()
  const pregao = searchParams.get("pregao")?.trim() ?? ""
  const ugg = searchParams.get("ugg")?.trim() ?? ""

  const { user, loading: userLoading } = useUser()
  const [itens, setItens] = useState<Item[]>([])
  const [linhasItens, setLinhasItens] = useState<RequisicaoItemLinha[]>([])
  const [itensLoading, setItensLoading] = useState(true)
  const [tipoLoading, setTipoLoading] = useState(true)
  const [notasCredito, setNotasCredito] = useState<NotaCredito[]>([])
  const [notasLoading, setNotasLoading] = useState(true)

  const paramsOk = Boolean(pregao && ugg)

  useLayoutEffect(() => {
    if (!paramsOk) return
    setItensLoading(true)
    setTipoLoading(true)
  }, [paramsOk, pregao, ugg])

  const {
    register,
    handleSubmit,
    setValue,
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

  useEffect(() => {
    if (ugg) {
      setValue("ug", ugg)
    }
  }, [ugg, setValue])

  useEffect(() => {
    const cargo = user?.designation?.position?.trim()
    if (cargo) {
      setValue("de", cargo)
    }
  }, [user, setValue])

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
  }, [paramsOk, pregao, ugg, setValue])

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
    const linhasComQuantidade = linhasItens.filter((l) => l.qtd > 0)
    if (linhasComQuantidade.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Informe a quantidade em pelo menos um item.",
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
    const detalhes = mapLinhasToRequisicaoPayload(linhasComQuantidade)
    const notaId = (values.notaCreditoId ?? "").trim()

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
        text: "Os dados foram salvos. O redirecionamento para a edição será adicionado em seguida.",
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

  const pageLoading =
    userLoading ||
    itensLoading ||
    notasLoading ||
    tipoLoading

  if (pageLoading) {
    return <CriarRequisicaoFormSkeleton />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Nova requisição</h1>
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
          title="Preenchido com o posto/função do seu usuário (perfil)"
          {...register("de")}
          className="cursor-not-allowed bg-zinc-50 text-zinc-800"
        />

        <Input label="Para" {...register("para")} />
        <Input
          label="Tipo"
          readOnly
          title="Tipo UASG do pregão (lista de pregões)"
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
        />
      </section>

      <div className="flex justify-end border-t border-zinc-200 pt-4">
        <Button type="submit" loading={isSubmitting} icon={Save}>
          Salvar requisição
        </Button>
      </div>
    </form>
  )
}
