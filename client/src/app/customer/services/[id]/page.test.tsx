import { render, screen } from "@testing-library/react";
import ServiceDetailPage from "./page";

// ── Next.js stubs ─────────────────────────────────────────────────────────────

// notFound() throws internally — give it a testable stub
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ── Feature component stubs ───────────────────────────────────────────────────
// ServiceDetailContent is a client component tested in its own file.
// Stub it here so we only test the page's routing / data-fetching logic.

jest.mock("../../../../components/features/serviceDetailContent", () => ({
  __esModule: true,
  default: ({
    service,
    pillClass,
    barClass,
  }: {
    service: { name: string; category: string };
    pillClass: string;
    barClass: string;
  }) => (
    <div
      data-testid="service-detail-content"
      data-pill={pillClass}
      data-bar={barClass}
    >
      {service.name} — {service.category}
    </div>
  ),
}));

// ── Global fetch mock ─────────────────────────────────────────────────────────

const MOCK_SERVICE = {
  id:          "svc-abc",
  name:        "Deep Cleaning",
  category:    "Cleaning",
  description: "A thorough clean of your home.",
  price:       350,
  duration:    120,
  isActive:    true,
  createdAt:   "2026-01-01T00:00:00.000Z",
  updatedAt:   "2026-01-01T00:00:00.000Z",
};

function mockFetchOk(service = MOCK_SERVICE) {
  global.fetch = jest.fn().mockResolvedValue({
    ok:   true,
    json: async () => ({ data: service }),
  } as Response);
}

function mockFetchNotOk(status = 404, statusText = "Not Found") {
  global.fetch = jest.fn().mockResolvedValue({
    ok:         false,
    status,
    statusText,
    json:       async () => ({}),
  } as Response);
}

function mockFetchThrows(message = "Network failure") {
  global.fetch = jest.fn().mockRejectedValue(new Error(message));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ServiceDetailPage — successful fetch", () => {
  it("renders ServiceDetailContent with the fetched service", async () => {
    mockFetchOk();
    render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) }));

    const content = screen.getByTestId("service-detail-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Deep Cleaning — Cleaning");
  });

  it("wraps the content in a <main> with id=main-content", async () => {
    mockFetchOk();
    render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) }));

    expect(document.getElementById("main-content")).toBeInTheDocument();
  });

  it("passes the correct Cleaning pillClass to ServiceDetailContent", async () => {
    mockFetchOk({ ...MOCK_SERVICE, category: "Cleaning" });
    render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) }));

    expect(screen.getByTestId("service-detail-content")).toHaveAttribute(
      "data-pill",
      "bg-teal-100   text-teal-700"
    );
  });

  it("passes the correct Cleaning barClass to ServiceDetailContent", async () => {
    mockFetchOk({ ...MOCK_SERVICE, category: "Cleaning" });
    render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) }));

    expect(screen.getByTestId("service-detail-content")).toHaveAttribute(
      "data-bar",
      "bg-teal-400"
    );
  });

  it("falls back to zinc classes for an unknown category", async () => {
    mockFetchOk({ ...MOCK_SERVICE, category: "Unknown" });
    render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) }));

    const content = screen.getByTestId("service-detail-content");
    expect(content).toHaveAttribute("data-pill", "bg-zinc-100 text-zinc-600");
    expect(content).toHaveAttribute("data-bar",  "bg-zinc-300");
  });
});

describe("ServiceDetailPage — category colour mapping", () => {
  const CATEGORIES: Array<{ category: string; pill: string; bar: string }> = [
    { category: "Plumbing",   pill: "bg-blue-100   text-blue-700",   bar: "bg-blue-400"   },
    { category: "Electrical", pill: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-400" },
    { category: "HVAC",       pill: "bg-cyan-100   text-cyan-700",   bar: "bg-cyan-400"   },
    { category: "Gardening",  pill: "bg-green-100  text-green-700",  bar: "bg-green-400"  },
  ];

  it.each(CATEGORIES)(
    "passes correct classes for $category",
    async ({ category, pill, bar }) => {
      mockFetchOk({ ...MOCK_SERVICE, category });
      render(await ServiceDetailPage({ params: Promise.resolve({ id: "svc-1" }) }));

      const content = screen.getByTestId("service-detail-content");
      expect(content).toHaveAttribute("data-pill", pill);
      expect(content).toHaveAttribute("data-bar",  bar);
    }
  );
});

describe("ServiceDetailPage — failed fetch (non-ok response)", () => {
  it("calls notFound() when the API returns 404", async () => {
    mockFetchNotOk(404, "Not Found");
    const { notFound } = jest.requireMock("next/navigation");

    await expect(
      ServiceDetailPage({ params: Promise.resolve({ id: "svc-missing" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound() when the API returns 500", async () => {
    mockFetchNotOk(500, "Internal Server Error");
    const { notFound } = jest.requireMock("next/navigation");

    await expect(
      ServiceDetailPage({ params: Promise.resolve({ id: "svc-err" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });
});

describe("ServiceDetailPage — fetch throws (network error)", () => {
  beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it("calls notFound() when fetch rejects", async () => {
    mockFetchThrows("Network failure");
    const { notFound } = jest.requireMock("next/navigation");

    await expect(
      ServiceDetailPage({ params: Promise.resolve({ id: "svc-net" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });
});

describe("ServiceDetailPage — fetch call details", () => {
  it("fetches from the correct URL using the param id", async () => {
    mockFetchOk();
    await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/services/svc-abc"),
      expect.objectContaining({ next: { revalidate: 60 } })
    );
  });

  it("uses revalidate: 60 for ISR caching", async () => {
    mockFetchOk();
    await ServiceDetailPage({ params: Promise.resolve({ id: "svc-abc" }) });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { next: { revalidate: 60 } }
    );
  });
});
