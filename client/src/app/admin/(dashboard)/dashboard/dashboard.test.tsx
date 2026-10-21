import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./dashabord";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("@/src/lib/axiosIntercepter", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

// BookingChart wraps recharts — stub it to avoid SVG/ResizeObserver issues
jest.mock("@/src/components/common/booking-chart", () => ({
  __esModule: true,
  default: () => <div data-testid="booking-chart">BookingChart</div>,
}));

jest.mock("./dashbaordCard", () => ({
  DashboardCards: ({ apiData }: { apiData: unknown }) => (
    <div data-testid="dashboard-cards">
      {apiData ? "cards-loaded" : "cards-loading"}
    </div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_SUMMARY = {
  bookings:  { total: 156, pending: 18, confirmed: 26, completed: 112, cancelled: 10 },
  revenue:   { totalCents: 999900, totalFormatted: "₹9,999" },
  services:  { total: 24, active: 18 },
  customers: { total: 87 },
};

// Render once and wait for the async fetch to settle inside act.
async function renderAndSettle() {
  const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
  api.get.mockResolvedValue({ data: MOCK_SUMMARY });
  render(<Dashboard />);
  // waitFor flushes microtasks inside act() — silences the act() warning
  await waitFor(() =>
    expect(screen.getByTestId("dashboard-cards")).toHaveTextContent("cards-loaded")
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Dashboard — structure", () => {
  beforeEach(renderAndSettle);

  it("renders the Dashboard heading", () => {
    expect(
      screen.getByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  it("renders the welcome subtitle", () => {
    expect(
      screen.getByText(/service management overview/i)
    ).toBeInTheDocument();
  });

  it("renders the BookingChart stub", () => {
    expect(screen.getByTestId("booking-chart")).toBeInTheDocument();
  });

  it("renders the Recent Bookings card title", () => {
    expect(screen.getByText("Recent Bookings")).toBeInTheDocument();
  });

  it("renders the Services Overview card title", () => {
    expect(screen.getByText("Services Overview")).toBeInTheDocument();
  });

  it("renders the 'View all' link for bookings pointing to /admin/bookings", () => {
    const links = screen.getAllByRole("link", { name: /view all/i });
    expect(links.some((l) => l.getAttribute("href") === "/admin/bookings")).toBe(true);
  });

  it("renders the 'View all' link for services pointing to /admin/services", () => {
    const links = screen.getAllByRole("link", { name: /view all/i });
    expect(links.some((l) => l.getAttribute("href") === "/admin/services")).toBe(true);
  });
});

describe("Dashboard — API fetch", () => {
  it("calls the summary API on mount", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    expect(api.get).toHaveBeenCalledWith("/admin/summary");
  });

  it("passes fetched data to DashboardCards", async () => {
    await renderAndSettle();
    expect(screen.getByTestId("dashboard-cards")).toHaveTextContent("cards-loaded");
  });
});

describe("Dashboard — recent bookings list", () => {
  beforeEach(renderAndSettle);

  it("renders static recent booking entries from fixture data", () => {
    // From dashbaord.ts recentBookings fixture
    expect(screen.getByText("Kiran Malve")).toBeInTheDocument();
    expect(screen.getByText("Rahul Sharma")).toBeInTheDocument();
  });

  it("renders PENDING badge for a pending booking", () => {
    const badges = screen.getAllByText("PENDING");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders COMPLETED badge for a completed booking", () => {
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });
});

describe("Dashboard — services overview list", () => {
  beforeEach(renderAndSettle);

  it("renders static service entries from fixture data", () => {
    expect(screen.getByText("Deep Cleaning")).toBeInTheDocument();
    expect(screen.getByText("Home Maintenance")).toBeInTheDocument();
  });

  it("shows Active badge for active services", () => {
    const activeBadges = screen.getAllByText("Active");
    expect(activeBadges.length).toBeGreaterThan(0);
  });

  it("shows Inactive badge for inactive services", () => {
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});
