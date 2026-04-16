"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/app/components/ui/data-table"
import { Tooltip } from "@/app/components/ui/tooltip"

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
            size: 60,
        },

        {
            accessorKey: "descricao",
            header: "Descrição",
            cell: ({ row }) => {
                const value = row.getValue("descricao") as string

                return (
                    <Tooltip content={value}>
                        <div className="max-w-[250px] truncate text-zinc-600 cursor-pointer">
                            {value}
                        </div>
                    </Tooltip>
                )
            },
        },

        {
            accessorKey: "fornecedor",
            header: "Fornecedor",
            cell: ({ row }) => {
                const value = row.getValue("fornecedor") as string
        
                return (
                    <Tooltip content={value}>
                        <div className="max-w-[150px] truncate text-zinc-600 cursor-pointer">
                            {value}
                        </div>
                    </Tooltip>
                )
            },
        },

        {
            accessorKey: "valorUnitario",
            header: "Valor",
            cell: ({ row }) => {
                const value = row.getValue("valorUnitario") as number

                return (
                    <span className="font-semibold text-green-600 whitespace-nowrap">
                        R$ {value.toFixed(2)}
                    </span>
                )
            },
        },

        {
            accessorKey: "qtdSaldo",
            header: "Saldo",
            cell: ({ row }) => {
                const value = row.getValue("qtdSaldo") as number

                return (
                    <span className="font-semibold text-blue-600 whitespace-nowrap">
                        {value}
                    </span>
                )
            },
        },
        {
            id: "total",
            header: "Total",
            cell: ({ row }) => {
                const valor = row.getValue("valorUnitario") as number
                const saldo = row.getValue("qtdSaldo") as number

                const total = valor * saldo

                return (
                    <span className="font-semibold text-purple-600 whitespace-nowrap">
                        R$ {total.toFixed(2)}
                    </span>
                )
            },
        },
    ]

    return <DataTable columns={columns} data={data} searchKey="descricao" />
}