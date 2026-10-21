import ServicesList from "./serviceList";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  badge?: string | null;
}

export type ServiceSort =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "duration-asc"
  | "duration-desc";

export interface ServiceFilters {
  search: string;
  category: string;
  sort: ServiceSort;
  page: number;
  limit: number;
}

interface ServicesResponse {
  services: Service[];
  categories: string[];
  total: number;
  error: string | null;
}

interface ApiResponse {
  data?: {
    data?: Service[];
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
    categories?: string[];
  };
}

const DEFAULT_SORT: ServiceSort = "name-asc";
const DEFAULT_LIMIT = 8;

const validSorts: ServiceSort[] = [
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
];

async function getServices(filters: ServiceFilters): Promise<ServicesResponse> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }

    const params = new URLSearchParams({
      search: filters.search,
      category: filters.category,
      sort: filters.sort,
      page: String(filters.page),
      limit: String(filters.limit),
    });

    const res = await fetch(`${apiUrl}/services?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        services: [],
        categories: [],
        total: 0,
        error: `Failed to load services (${res.status} ${res.statusText})`,
      };
    }

    const json: ApiResponse = await res.json();
    const services = json?.data?.data ?? [];
    const total = json?.data?.pagination?.total ?? 0;

    const categories =
      json?.data?.categories ??
      Array.from(new Set(services.map((service) => service.category)));

    return {
      services,
      categories,
      total,
      error: null,
    };
  } catch (err) {
    console.error("[ServicesSection] fetch error:", err);

    return {
      services: [],
      categories: [],
      total: 0,
      error: "Unable to connect to the server. Please try again.",
    };
  }
}

interface ServicesSectionProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ServicesSection({
  searchParams,
}: ServicesSectionProps) {
  const params = await searchParams;

  const getParam = (key: string): string => {
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  };

  const rawSort = getParam("sort") as ServiceSort;

  const filters: ServiceFilters = {
    search: getParam("search"),
    category: getParam("category"),
    sort: validSorts.includes(rawSort) ? rawSort : DEFAULT_SORT,
    page: Math.max(1, Number.parseInt(getParam("page") || "1", 10) || 1),
    limit: Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(getParam("limit") || String(DEFAULT_LIMIT), 10) ||
          DEFAULT_LIMIT,
      ),
    ),
  };

  const { services, categories, total, error } = await getServices(filters);

  if (error) {
    return (
      <section className="py-12 text-center" role="alert">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <>
      <ServicesList
        services={services}
        categories={categories}
        total={total}
        filters={filters}
      />
    </>
  );
}
