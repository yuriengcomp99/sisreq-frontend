"use client"

import { FileText, Tag, Calendar, Package, Building2, FilePlus, Eye  } from "lucide-react"
import { useEffect, useState } from "react"
import { getPregoes } from "@/app/services/pregoes-service"
import { Button } from "@/app/components/ui/button"
import { formatDate } from "@/app/lib/format"
import { ItemsModal } from "@/app/(dashboard)/pregoes/components/items-modal"

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
  const [openModal, setOpenModal] = useState(false)
  const [selectedPregao, setSelectedPregao] = useState<{
    pregao: string
    ugg: string
  } | null>(null)

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
          className="
            bg-white 
            rounded-xl 
            border border-zinc-200 
            p-5 
            flex 
            justify-between 
            gap-6
            hover:shadow-md hover:border-zinc-300
            transition
          "
        >
  
          <div className="flex flex-col gap-3 flex-1">
  
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-blue-50 text-blue-600 font-medium">
                <FileText size={14} />
                {pregao.pregao}
              </span>
  
              <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-zinc-100 text-zinc-600">
                <Tag size={14} />
                {pregao.tipoUasg}
              </span>
            </div>
  
            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed">
              {pregao.objeto}
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
  
              <div className="flex items-center gap-2">
                <Calendar size={32} className="text-custom-blue" />
                <div>
                  <span className="block text-xs text-zinc-400">Início</span>
                  {formatDate(pregao.inicioVigAta)}
                </div>
              </div>
  
              <div className="flex items-center gap-2">
                <Calendar size={32} className="text-custom-blue" />
                <div>
                  <span className="block text-xs text-zinc-400">Fim</span>
                  {formatDate(pregao.fimVigAta)}
                </div>
              </div>
  
              <div className="flex items-center gap-2">
                <Package size={32} className="text-custom-blue" />
                <div>
                  <span className="block text-xs text-zinc-400">Itens</span>
                  <span className="font-medium text-blue-600">
                    {pregao.qtdItensDisponiveis}
                  </span>
                </div>
              </div>
  
              <div className="flex items-center gap-2">
                <Building2 size={32} className="text-custom-blue" />
                <div>
                  <span className="block text-xs text-zinc-400">UGG</span>
                  {pregao.ugg}
                </div>
              </div>
  
            </div>
          </div>
  
          <div className="flex flex-col justify-between items-end">
  
            <div className="flex gap-2">
              <Button
                icon={FilePlus}
              >
                Gerar Requisição
              </Button>
  
              <Button
                icon={Eye}
                onClick={() => {
                  setSelectedPregao({
                    pregao: pregao.pregao,
                    ugg: pregao.ugg,
                  })
                  setOpenModal(true)
                }}
              >
                Itens
              </Button>
            </div>
  
          </div>
  
        </div>
      ))}
  
      <ItemsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        pregao={selectedPregao?.pregao || ""}
        ugg={selectedPregao?.ugg || ""}
      />
    </div>
  )
}