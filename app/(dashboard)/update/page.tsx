"use client"

import { useForm } from "react-hook-form"
import Swal from "sweetalert2"
import FileUpload from "@/app/components/ui/file-upload"
import { Button } from "@/app/components/ui/button"
import { importPregoes } from "@/app/services/pregoes-service"
import { useState } from "react"

export default function UploadPage() {
  const { handleSubmit } = useForm()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    if (!file) {
      return Swal.fire({
        icon: "warning",
        title: "Nenhum arquivo selecionado",
      })
    }

    try {
      setLoading(true)

      const response = await importPregoes(file)

      await Swal.fire({
        icon: "success",
        title: response.mensagem,
        timer: 1500,
        showConfirmButton: false,
      })

    } catch (err: any) {
      await Swal.fire({
        icon: "error",
        title: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Atualizar Dados
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow flex flex-col gap-4"
      >
        <FileUpload onFileSelect={setFile} />

        <Button type="submit" loading={loading}>
          Enviar Arquivo
        </Button>
      </form>
    </div>
  )
}