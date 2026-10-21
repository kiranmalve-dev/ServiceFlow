"use client";

import api from "@/src/lib/axiosIntercepter";
import React from "react";
import { Search, X } from "lucide-react";
import { User, UserPagination } from "./type";
import { getUserColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";
import { useDebounce } from "@/src/hooks/useDebounce";

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    data: User[];
    meta: UserPagination;
  };
}

export default function UsersPage() {
  const { msgs } = useLocaleStore();

  // --- data state ---
  const [users, setUsers] = React.useState<User[]>([]);
  const [meta, setMeta] = React.useState<UserPagination>({
    total: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = React.useState(true);

  // --- filter state ---
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"" | "true" | "false">("");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const debouncedSearch = useDebounce(search, 400);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchUsers = React.useCallback((currentPage: number) => {
    const params: Record<string, string | number> = {
      page: currentPage + 1,
      pageSize,
    };
    if (debouncedSearch)     params["search"]   = debouncedSearch;
    if (statusFilter !== "") params["isActive"] = statusFilter;

    Promise.resolve()
      .then(() => { setLoading(true); })
      .then(() => api.get<UsersResponse>("/admin/users", { params }))
      .then((response) => {
        setUsers(response?.data?.data ?? []);
        if (response?.data?.meta) setMeta(response.data.meta);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch users:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pageSize, debouncedSearch, statusFilter]);

  React.useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  // ── Filter handlers — reset page in the event handler, no extra effect ──────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusChange = (value: string | null) => {
    if (value === null) return;
    setStatusFilter(value as "" | "true" | "false");
    setPage(0);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = (user: User) => {
    const confirmed = window.confirm(
      `${t(msgs, "admin.deleteConfirm")} "${user.name}"?`
    );
    if (!confirmed) return;

    api
      .delete(`/admin/users/${user.id}`)
      .then(() => {
        fetchUsers(page);
      })
      .catch((error: unknown) => {
        console.error("Failed to delete user:", error);
      });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(0);
  };

  const hasActiveFilters = search !== "" || statusFilter !== "";

  const columns = React.useMemo(
    () => getUserColumns({ onDelete: handleDelete }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [msgs]
  );

  const filtersSlot = (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 w-64"
        />
      </div>

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
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
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t(msgs, "admin.users")}</h1>
        <p className="text-sm text-muted-foreground">
          {t(msgs, "admin.usersSubtitle")}
        </p>
      </div>

      <DataTable
        columns={columns}
        data={users}
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
