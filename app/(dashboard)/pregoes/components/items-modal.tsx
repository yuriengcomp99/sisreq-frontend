"use client"

import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/app/components/ui/modal"
import { Button } from "@/app/components/ui/button"
import { useEffect, useState } from "react"
import { ItemsTable } from "./items-table"
import { getPregaoItens, Item } from "@/app/services/pregoes-service"

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
        console.error("Erro ao buscar itens:", err)
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
        Itens do Pregão {pregao}
      </ModalHeader>

      <ModalBody>

        <p className="text-sm text-zinc-500 mb-4">
          UGG: {ugg}
        </p>

        {loading ? (
          <p>Carregando itens...</p>
        ) : (
          <ItemsTable data={items} />
        )}

      </ModalBody>

      <ModalFooter>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </ModalFooter>

    </Modal>
  )
}