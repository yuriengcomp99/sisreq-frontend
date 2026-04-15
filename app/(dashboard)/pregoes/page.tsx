"use client"

import { FileText, Tag, FilePlus, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { getPregoes } from "@/app/services/pregoes-service"
import { Button } from "@/app/components/ui/button"
import { formatDate } from "@/app/lib/format"

interface Pregao {
  pregao: string
  objeto: string
  ugg: string
  tipoUasg: string
  inicioVigAta: string
  fimVigAta: string
  qtdItensDisponiveis: number
}

export default function PregoesPage() {
  const [pregoes, setPregoes] = useState<Pregao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPregoes() {
      try {
        const response = await getPregoes()
        setPregoes(response.dados)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPregoes()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Lista de Pregões</h1>
  
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col gap-4 animate-pulse"
          >

            <div className="flex gap-2">
              <div className="h-6 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-6 w-28 bg-gray-200 rounded-lg"></div>
            </div>
  
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
            </div>
  
            {/* INFORMAÇÕES */}
            <div className="flex justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
  
              <div className="flex flex-col gap-2">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </div>
  
              <div className="flex flex-col gap-2">
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
  
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-2 items-end">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
  
                <div className="h-8 w-32 bg-gray-200 rounded-md"></div>
                <div className="h-8 w-32 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Lista de Pregões</h1>

      {pregoes.map((pregao, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col gap-4"
        >

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 px-3 py-1 rounded-lg border border-custom-blue text-custom-blue text-sm font-semibold">
              <FileText size={14} />
              {pregao.pregao}
            </span>

            <span className="flex items-center gap-1 px-3 py-1 rounded-lg border border-custom-blue text-custom-blue text-sm font-semibold">
              <Tag size={14} />
              {pregao.tipoUasg}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-custom-blue">
              Objeto
            </span>
            <p className="text-sm text-gray-text">
              {pregao.objeto}
              Registro de preços para futura aquisição de materiais de limpeza e conservação para manutenção das instalações da unidade, incluindo detergentes, ceras, desinfetantes e insumos diversos.
            </p>
          </div>

          <div className="flex flex-wrap justify-between gap-4 items-end">
            
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-custom-blue">
                 Início vigência
              </span>
              <span className="text-sm text-gray-text">
              {formatDate(pregao.inicioVigAta)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-custom-blue">
                Fim vigência
              </span>
              <span className="text-sm text-gray-text">
              {formatDate(pregao.fimVigAta)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-custom-blue">
                Itens disponíveis
              </span>
              <span className="text-sm text-gray-text">
                {pregao.qtdItensDisponiveis}
              </span>
            </div>

            <div className="flex items-end gap-3">
              
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-custom-blue">
                  UGG
                </span>
                <span className="text-sm text-gray-text">
                  {pregao.ugg}
                </span>
              </div>

              <Button icon={FilePlus}>
                Gerar Requisição
              </Button>

              <Button icon={Eye}>
                Visualizar Itens
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}