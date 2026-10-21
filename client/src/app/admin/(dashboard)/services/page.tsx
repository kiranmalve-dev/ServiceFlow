"use client";

import api from "@/src/lib/axiosIntercepter";
import React from "react";
import { Plus, Search, X } from "lucide-react";
import { Service, ServicePagination } from "./type";
import { getServiceColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import CreateServiceDialog from "./createServiceDialog";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";
import { useDebounce } from "@/src/hooks/useDebounce";

interface ServicesResponse {
  success: boolean;
  message: string;
  data: {
    data: Service[];
    meta: ServicePagination;
  };
}

export default function ServicesPage() {
  const { msgs } = useLocaleStore();

  // --- data state ---
  const [services, setServices] = React.useState<Service[]>([]);
  const [meta, setMeta] = React.useState<ServicePagination>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editService, setEditService] = React.useState<Service | null>(null);

  // --- filter state ---
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"" | "true" | "false">("");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const debouncedSearch = useDebounce(search, 400);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // Uses .then()/.catch() so setState is called inside a callback, not
  // synchronously in the effect body — satisfies the Next.js lint rule.

  const fetchServices = React.useCallback((currentPage: number) => {
    const params: Record<string, string | number> = {
      page: currentPage + 1,
      pageSize,
    };
    if (debouncedSearch)     params["search"]   = debouncedSearch;
    if (statusFilter !== "") params["isActive"] = statusFilter;

    Promise.resolve()
      .then(() => { setLoading(true); })
      .then(() => api.get<ServicesResponse>("/services", { params }))
      .then((response) => {
        setServices(response?.data?.data ?? []);
        if (response?.data?.meta) setMeta(response.data.meta);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch services:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageSize, debouncedSearch, statusFilter]);

  // Fetch whenever page or the stable fetchServices reference changes.
  React.useEffect(() => {
    fetchServices(page);
  }, [fetchServices, page]);

  // ── Filter handlers — reset page via setter, no separate effect needed ──────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusChange = (value: string | null) => {
    if (value === null) return;
    setStatusFilter(value === "all" ? "" : (value as "true" | "false"));
    setPage(0);
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleEdit = React.useCallback((service: Service) => {
    setEditService(service);
  }, []);

  const handleDelete = React.useCallback((service: Service) => {
    const confirmed = window.confirm(
      `${t(msgs, "admin.deleteConfirm")} "${service.name}"?`
    );
    if (!confirmed) return;

    api
      .delete(`/admin/services/${service.id}`)
      .then(() => {
        fetchServices(page);
      })
      .catch((error: unknown) => {
        console.error("Failed to delete service:", error);
        window.alert(t(msgs, "admin.unableToDelete"));
      });
  }, [msgs, fetchServices, page]);

  const handleCreated = (newService: Service) => {
    setServices((prev) => [newService, ...prev]);
    setMeta((m) => ({ ...m, total: m.total + 1 }));
  };

  const handleUpdated = (updatedService: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(0);
  };

  const hasActiveFilters = search !== "" || statusFilter !== "";

  const columns = React.useMemo(
    () => getServiceColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  );

  const filtersSlot = (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 w-64"
        />
      </div>

      {/* Status filter */}
      <Select
        value={statusFilter === "" ? "all" : statusFilter}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="size-3.5" /> Clear
        </Button>
      )}
    </>
  );

  return (
    <>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t(msgs, "admin.services")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(msgs, "admin.servicesSubtitle")}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5 shrink-0">
            <Plus className="size-4" aria-hidden="true" />
            {t(msgs, "admin.newService")}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          totalCount={meta.total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          filtersSlot={filtersSlot}
        />
      </div>

      <CreateServiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      {/* Edit dialog — opens with the selected service pre-populated */}
      <CreateServiceDialog
        open={editService !== null}
        onOpenChange={(open) => { if (!open) setEditService(null); }}
        service={editService}
        onUpdated={handleUpdated}
      />
    </>
  );
}
