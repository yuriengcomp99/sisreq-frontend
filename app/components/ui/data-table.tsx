"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { useState } from "react"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
}: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("")

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="space-y-4">

            {searchKey && (
                <div className="flex justify-end">
                    <Input
                        placeholder="Buscar itens"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-xs h-9 text-sm"
                    />
                </div>
            )}

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">

                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-300"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="
                    border-t border-zinc-100 dark:border-zinc-800
                    hover:bg-zinc-50 dark:hover:bg-zinc-900
                    transition
                  "
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 align-middle">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-10 text-center text-zinc-500"
                                >
                                    Nenhum item encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">

                <span className="text-xs text-zinc-500">
                    Página {table.getState().pagination.pageIndex + 1}
                </span>

                <div className="flex gap-2">
                    <Button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft size={20} />
                    </Button>

                    <Button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex items-center gap-1"
                    >
                        <ChevronRight size={20} />
                    </Button>
                </div>
            </div>
        </div>
    )
}