import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/app/components/ui/modal"
import { Button } from "@/app/components/ui/button"
import { useEffect } from "react"

interface ItemsModalProps {
  open: boolean
  onClose: () => void
  pregao: string
  ugg: string
}

export function ItemsModal({ open, onClose, pregao, ugg }: ItemsModalProps) {

  useEffect(() => {
    if (open) {
      console.log("Buscar itens do pregão:", pregao, ugg)
      // aqui, chamar API:
    }
  }, [open, pregao, ugg])

  return (
    <Modal open={open} onClose={onClose}>
      
      <ModalHeader>
        Itens do Pregão {pregao}
      </ModalHeader>

      <ModalBody>
        <p className="text-sm text-zinc-500">
          UGG: {ugg}
        </p>

        <div className="mt-4">
          <p>Lista de itens aqui...</p>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </ModalFooter>

    </Modal>
  )
}