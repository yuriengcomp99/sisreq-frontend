"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
}

export default function FileUpload({
  onFileSelect,
  accept = ".xlsx,.csv",
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (file) {
      setFileName(file.name)
      onFileSelect(file)
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
        
        <div className="flex flex-col items-center justify-center gap-2 text-gray-text">
          <Upload size={20} />
          <span className="text-sm font-medium">
            Clique ou arraste um arquivo
          </span>
          <span className="text-xs text-gray-400">
            Excel ou CSV
          </span>
        </div>

        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
      </label>

      {fileName && (
        <span className="text-xs text-gray-500">
          Arquivo selecionado: {fileName}
        </span>
      )}
    </div>
  )
}