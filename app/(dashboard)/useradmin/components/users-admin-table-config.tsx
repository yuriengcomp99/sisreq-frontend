"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FiEdit2, FiTrash2 } from "react-icons/fi"
import { Tooltip } from "@/app/components/ui/tooltip"
import type { User } from "@/app/services/auth-service"

export interface UsersAdminTableActions {
  onEdit: (row: User) => void
  onDelete: (row: User) => void
}

function cellText(value: string | null | undefined) {
  const t = (value ?? "").trim()
  return t.length ? t : "—"
}

export function createUsersAdminTableColumns({
  onEdit,
  onDelete,
}: UsersAdminTableActions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "first_name",
      header: "Nome",
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-zinc-800">
          {cellText(row.original.first_name)}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "E-mail",
      cell: ({ row }) => {
        const value = cellText(row.original.email)
        return (
          <Tooltip content={value}>
            <div className="max-w-[220px] cursor-default truncate text-zinc-600">
              {value}
            </div>
          </Tooltip>
        )
      },
    },
    {
      id: "funcao",
      header: "Função",
      accessorFn: (row) => cellText(row.designation?.position),
      cell: ({ row }) => {
        const value = cellText(row.original.designation?.position)
        return (
          <Tooltip content={value}>
            <div className="max-w-[180px] cursor-default truncate text-zinc-700">
              {value}
            </div>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Perfil",
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium text-zinc-800">
          {cellText(row.original.role)}
        </span>
      ),
    },
    {
      accessorKey: "om",
      header: "OM",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-zinc-700">
          {cellText(row.original.om)}
        </span>
      ),
    },
    {
      id: "acoes",
      header: "Ações",
      size: 120,
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Editar"
              onClick={() => onEdit(u)}
              className="cursor-pointer rounded p-2 text-custom-blue transition hover:bg-blue-50"
            >
              <FiEdit2 size={18} aria-hidden />
            </button>
            <button
              type="button"
              title="Excluir"
              onClick={() => onDelete(u)}
              className="cursor-pointer rounded p-2 text-red-600 transition hover:bg-red-50"
            >
              <FiTrash2 size={18} aria-hidden />
            </button>
          </div>
        )
      },
    },
  ]
}
