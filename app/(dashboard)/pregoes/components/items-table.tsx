"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/app/components/ui/data-table"

interface Item {
  nrItem: string
  descricao: string
  fornecedor: string
  valorUnitario: number
  qtdSaldo: number
}

interface ItemsTableProps {
  data: Item[]
}

export function ItemsTable({ data }: ItemsTableProps) {
  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "nrItem",
      header: "Item",
    },
    {
      accessorKey: "descricao",
      header: "Descrição",
    },
    {
      accessorKey: "fornecedor",
      header: "Fornecedor",
    },
    {
      accessorKey: "valorUnitario",
      header: "Valor",
      cell: ({ row }) => {
        const value = row.getValue("valorUnitario") as number
        return `R$ ${value.toFixed(2)}`
      },
    },
    {
      accessorKey: "qtdSaldo",
      header: "Saldo",
    },
  ]

  return <DataTable columns={columns} data={data} searchKey="descricao" />
}