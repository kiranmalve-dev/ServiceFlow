import { type ReactTable, type RowData } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import { type DataTableFeatures } from "./data-table-features"

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
  // When these are supplied the component uses them instead of the
  // TanStack row model counts (server-side pagination mode).
  totalCount?: number
  serverPage?: number
  serverPageSize?: number
}

export function DataTablePagination<TData extends RowData>({
  table,
  totalCount,
  serverPage,
  serverPageSize,
}: DataTablePaginationProps<TData>) {
  const isServerSide =
    totalCount !== undefined &&
    serverPage !== undefined &&
    serverPageSize !== undefined

  const pageCount = isServerSide
    ? Math.max(1, Math.ceil(totalCount / serverPageSize!))
    : table.getPageCount()

  const currentPage = isServerSide
    ? serverPage!
    : table.state.pagination.pageIndex

  const currentPageSize = isServerSide
    ? serverPageSize!
    : table.state.pagination.pageSize

  const canPrev = currentPage > 0
  const canNext = currentPage < pageCount - 1

  return (
    <div className="flex items-center justify-between px-2">
      {/* Row count — only meaningful in client-side mode */}
      <div className="flex-1 text-sm text-muted-foreground">
        {isServerSide ? (
          <span>{totalCount} total record{totalCount !== 1 ? "s" : ""}</span>
        ) : (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${currentPageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex w-[110px] items-center justify-center text-sm font-medium">
          Page {currentPage + 1} of {pageCount}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrev}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!canPrev}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!canNext}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNext}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
