"use client"

import * as React from "react"
import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { features, type DataTableFeatures } from "./data-table-features"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData extends RowData> {
  // Accept both the 3-param v9 form ColumnDef<DataTableFeatures, TData, any>
  // and the 2-param form ColumnDef<TData, any> via the widened union below.
  columns: ColumnDef<DataTableFeatures, TData, unknown>[]
  data: TData[]

  // Server-side pagination — pass these to take over pagination controls
  totalCount?: number
  page?: number          // 0-indexed
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void

  // Slot for module-specific filter controls rendered above the table
  filtersSlot?: React.ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  totalCount,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  filtersSlot,
}: DataTableProps<TData>) {
  const isServerSide =
    totalCount !== undefined && onPageChange !== undefined

  const table = useTable({
    features,
    data,
    columns,
    // When server-side, tell TanStack the true total row count
    ...(isServerSide && {
      rowCount: totalCount,
      manualPagination: true,
      state: {
        pagination: { pageIndex: page, pageSize },
      },
      onPaginationChange: (updater) => {
        const next =
          typeof updater === "function"
            ? updater({ pageIndex: page, pageSize })
            : updater
        if (next.pageIndex !== page) onPageChange?.(next.pageIndex)
        if (next.pageSize !== pageSize) onPageSizeChange?.(next.pageSize)
      },
    }),
  })

  return (
    <div className="space-y-4">
      {/* Module-specific filter controls */}
      {filtersSlot && (
        <div className="flex flex-wrap items-end gap-3 py-2">
          {filtersSlot}
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        <table.FlexRender header={header} />
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel()?.rows?.length ? (
              table?.getRowModel()?.rows?.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        // Pass explicit server-side counts when available
        totalCount={isServerSide ? totalCount : undefined}
        serverPage={isServerSide ? page : undefined}
        serverPageSize={isServerSide ? pageSize : undefined}
      />
    </div>
  )
}
