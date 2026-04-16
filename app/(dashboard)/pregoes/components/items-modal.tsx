"use client"

import { Modal, ModalHeader, ModalBody} from "@/app/components/ui/modal"
import { useEffect, useState } from "react"
import { ItemsTable } from "./items-table"
import { getPregaoItens, Item } from "@/app/services/pregoes-service"
import { X } from "lucide-react"

interface ItemsModalProps {
  open: boolean
  onClose: () => void
  pregao: string
  ugg: string
}

export function ItemsModal({ open, onClose, pregao, ugg }: ItemsModalProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true)
        const response = await getPregaoItens(pregao, ugg)
        setItems(response.dados)
      } catch (err) {
        console.error(err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    if (open && pregao && ugg) {
      loadItems()
    }
  }, [open, pregao, ugg])

  return (
    <Modal open={open} onClose={onClose}>
      
       <ModalHeader>
        <div className="flex items-start justify-between w-full">

            <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                Itens do Pregão
            </h2>
            <p className="text-sm text-zinc-500">
                Pregão <span className="font-medium">{pregao}</span> • UGG {ugg}
            </p>
            </div>

            <button
            onClick={onClose}
            className="
                p-2 rounded-md
                text-zinc-500
                hover:text-zinc-700
                hover:bg-zinc-100
                dark:hover:bg-zinc-800
                transition
            "
            >
            <X size={18} />
            </button>

        </div>
      </ModalHeader>

      <ModalBody>

        {loading ? (
          <SkeletonTable />
        ) : (
          <ItemsTable data={items} />
        )}

      </ModalBody>
    </Modal>
  )
}

function SkeletonTable() {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    )
  }