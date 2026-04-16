"use client"

import { ReactNode, useEffect } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleEsc)
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl mx-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl animate-in fade-in zoom-in-95">
        
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {children}
        </div>

      </div>
    </div>
  )
}

export function ModalHeader({ children }: { children: ReactNode }) {
  return (
    <div className="pb-2">
      <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        {children}
      </h2>
    </div>
  )
}

export function ModalBody({ children }: { children: ReactNode }) {
  return (
    <div className="py-2 text-sm text-zinc-600 dark:text-zinc-300">
      {children}
    </div>
  )
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 flex justify-end gap-2 border-t pt-4">
      {children}
    </div>
  )
}