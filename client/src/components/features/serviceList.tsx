"use client";

import { useId, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Clock, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import BookButton from "./serviceRedirect";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  badge?: string | null;
}

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "duration-desc";

export interface ServiceFilters {
  search: string;
  category: string;
  sort: SortOption;
  page: number;
  limit: number;
}

interface ServicesListProps {
  services: Service[];
  categories: string[];
  total: number;
  filters: ServiceFilters;
}

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Name: A – Z",
  "name-desc": "Name: Z – A",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "duration-asc": "Duration: Shortest",
  "duration-desc": "Duration: Longest",
};

const CATEGORY_PILL: Record<string, string> = {
  Cleaning: "bg-teal-100 text-teal-700",
  Plumbing: "bg-blue-100 text-blue-700",
  Electrical: "bg-yellow-100 text-yellow-700",
  HVAC: "bg-cyan-100 text-cyan-700",
  Gardening: "bg-green-100 text-green-700",
  Beauty: "bg-pink-100 text-pink-700",
  Wellness: "bg-purple-100 text-purple-700",
  Fitness: "bg-orange-100 text-orange-700",
};

const CATEGORY_BAR: Record<string, string> = {
  Cleaning: "bg-teal-400",
  Plumbing: "bg-blue-400",
  Electrical: "bg-yellow-400",
  HVAC: "bg-cyan-400",
  Gardening: "bg-green-400",
  Beauty: "bg-pink-400",
  Wellness: "bg-purple-400",
  Fitness: "bg-orange-400",
};

export default function ServicesList({
  services,
  categories,
  total,
  filters,
}: ServicesListProps) {
  const searchId = useId();
  const sortId = useId();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!("page" in updates)) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const currentCategory = filters.category || "All";
  const allCategories = ["All", ...categories.filter((c) => c !== "All")];
  const hasFilters = currentCategory !== "All" || filters.search.trim() !== "";
  const hasMore = services.length < total;

  function clearFilters() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  function handleLoadMore() {
    const nextPage = filters.page + 1;
    updateQueryParams({ page: String(nextPage) });
  }

  return (
    <div className={`space-y-6 ${isPending ? "opacity-60 transition-opacity" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Search services
          </label>
          <Search
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            id={searchId}
            type="search"
            defaultValue={filters.search}
            onChange={(e) => updateQueryParams({ search: e.target.value })}
            placeholder="Search services…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm
              text-zinc-900 placeholder:text-zinc-400 shadow-sm
              hover:border-zinc-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => updateQueryParams({ search: null })}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded
                text-zinc-400 hover:text-zinc-600 transition-colors
                focus:outline-2 focus:outline-blue-500"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <label htmlFor={sortId} className="sr-only">
            Sort services
          </label>
          <SlidersHorizontal
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <select
            id={sortId}
            value={filters.sort}
            onChange={(e) => updateQueryParams({ sort: e.target.value })}
            className="appearance-none rounded-lg border border-zinc-200 bg-white
              py-2.5 pl-8 pr-8 text-sm text-zinc-700 shadow-sm cursor-pointer
              hover:border-zinc-300 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter by category"
        className="flex flex-wrap gap-2"
      >
        {allCategories.map((cat) => {
          const isActive = cat === currentCategory;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={isActive}
              onClick={() => updateQueryParams({ category: cat })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              {cat}
            </button>
          );
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium
              border border-dashed border-zinc-300 text-zinc-400
              hover:border-red-300 hover:text-red-500 hover:bg-red-50
              transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500" aria-live="polite" aria-atomic="true">
          {total === 0
            ? "No services found"
            : `Showing ${services.length} of ${total} service${total !== 1 ? "s" : ""}`}
        </p>

        {services.length > 0 && (
          <p className="text-xs text-zinc-400">
            Sorted by{" "}
            <span className="font-medium text-zinc-600">
              {SORT_LABELS[filters.sort]}
            </span>
          </p>
        )}
      </div>

      {services.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
          <p className="text-zinc-700 font-semibold text-base mb-1">
            No services match your filters
          </p>
          <p className="text-zinc-400 text-sm mb-5">
            Try adjusting the category, search term, or sorting.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm
              font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Clear all filters
          </button>
        </div>
      )}
      {services.length > 0 && (
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {services.map((service) => (
            <li key={service.id}>
              <article
                aria-labelledby={`svc-${service.id}-title`}
                className="h-full flex flex-col rounded-xl border border-zinc-200 bg-white
                  shadow-sm hover:shadow-md hover:-translate-y-0.5
                  transition-all duration-200 overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className={`h-1.5 w-full ${CATEGORY_BAR[service.category] ?? "bg-zinc-300"}`}
                />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${CATEGORY_PILL[service.category] ?? "bg-zinc-100 text-zinc-600"}`}
                    >
                      {service.category}
                    </span>
                    {service.badge && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold
                        bg-blue-100 text-blue-700">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    id={`svc-${service.id}-title`}
                    className="text-base font-semibold text-zinc-900 mb-1.5"
                  >
                    {service.name}
                  </h3>

                  <p className="text-sm text-zinc-500 flex-1 mb-4 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="font-bold text-blue-700 text-base">
                      ${service.price}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock size={13} aria-hidden="true" />
                      {service.duration} min
                    </span>
                  </div>

                  <BookButton
                    serviceId={service.id}
                    serviceName={service.name}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center mt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleLoadMore}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white
              transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {isPending ? "Loading..." : `Load More (${total - services.length} remaining)`}
          </button>
        </div>
      )}

      {!hasMore && services.length > 0 && (
        <p className="mt-2 text-center text-sm text-zinc-400">
          All {total} services shown
        </p>
      )}
    </div>
  );
}