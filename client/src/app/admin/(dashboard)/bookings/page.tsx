"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Booking, BookingPagination, BookingStatus } from "./type";
import api from "@/src/lib/axiosIntercepter";
import { DataTable } from "@/src/components/common/data-table";
import { getBookingColumns } from "./column";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useDebounce } from "@/src/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface BookingsResponse {
  success: boolean;
  message: string;
  data: {
    data: Booking[];
    meta: BookingPagination;
  };
}

const STATUS_OPTIONS: { label: string; value: BookingStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending",      value: "PENDING" },
  { label: "Confirmed",    value: "CONFIRMED" },
  { label: "Completed",    value: "COMPLETED" },
  { label: "Cancelled",    value: "CANCELLED" },
];

export default function BookingPage() {
  const { msgs } = useLocaleStore();

  // --- data state ---
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [meta, setMeta] = React.useState<BookingPagination>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // --- filter state ---
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "">("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  // debounced search — fires API 400 ms after user stops typing
  const debouncedSearch = useDebounce(search, 400);

  // reset to page 0 whenever any filter changes
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, dateFrom, dateTo]);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {         
        page: page + 1,
        pageSize 
      };
      if (debouncedSearch) params["search"] = debouncedSearch;
      if (statusFilter)    params["status"]  = statusFilter;
      if (dateFrom)        params["dateFrom"] = dateFrom;
      if (dateTo)          params["dateTo"]   = dateTo;

      const response = await api.get<BookingsResponse>("/admin/bookings", { params });
      setBookings(response?.data?.data ?? []);
      if (response?.data?.meta) setMeta(response?.data?.meta);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message ?? t(msgs, "admin.error.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, dateFrom, dateTo, msgs]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      if (res?.success) fetchBookings();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };
  const hasActiveFilters =
    search !== "" || statusFilter !== "" || dateFrom !== "" || dateTo !== "";

  const columns = React.useMemo(
    () => getBookingColumns({ onStatusChange: updateStatus, msgs }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [msgs]
  );

  const filtersSlot = (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t(msgs, "admin.filters.search") + "…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 w-56"
        />
      </div>

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as BookingStatus | "")}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t(msgs, "admin.filters.allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.value === ""
                ? t(msgs, "admin.filters.allStatuses")
                : t(msgs, `admin.status.${opt.value.toLowerCase()}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t(msgs, "admin.filters.dateFrom")}
        </label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[150px] h-9"
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t(msgs, "admin.filters.dateTo")}
        </label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[150px] h-9"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 self-end"
        >
          <X className="size-3.5" /> Clear
        </Button>
      )}
    </>
  );

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t(msgs, "admin.bookings")}</h1>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            {t(msgs, "admin.error.retry")}
          </Button>
        </div>
      )}

      <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          totalCount={meta.total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          filtersSlot={filtersSlot}
        />
    </div>
  );
}
