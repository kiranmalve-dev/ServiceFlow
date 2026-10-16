"use client"

import * as React from "react"
import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

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
  columns: ColumnDef<DataTableFeatures, TData, unknown>[]
  data: TData[]
  loading?: boolean

  // Server-side pagination
  totalCount?: number
  page?: number        // 0-indexed
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void

  // Slot for module-specific filter controls rendered above the table
  filtersSlot?: React.ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  loading = false,
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
            {loading ? (
              /* ── Spinner row — shown while fetching ── */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-blue-500" />
                    <span className="text-sm">Loading…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              /* ── Data rows ── */
              table.getRowModel().rows.map((row) => (
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
              /* ── Empty state ── */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
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
        totalCount={isServerSide ? totalCount : undefined}
        serverPage={isServerSide ? page : undefined}
        serverPageSize={isServerSide ? pageSize : undefined}
      />
    </div>
  )
}
