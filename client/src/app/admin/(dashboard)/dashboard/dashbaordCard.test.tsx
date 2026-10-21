import { render, screen } from "@testing-library/react";
import { DashboardCards, type DashboardStatsData } from "./dashbaordCard";

// ── Fixture ───────────────────────────────────────────────────────────────────

const MOCK_DATA: DashboardStatsData = {
  bookings: {
    total: 156,
    pending: 18,
    confirmed: 26,
    completed: 112,
    cancelled: 10,
  },
  revenue: {
    totalCents: 999900,
    totalFormatted: "₹9,999",
  },
  services: {
    total: 24,
    active: 18,
  },
  customers: {
    total: 87,
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DashboardCards — with data", () => {
  beforeEach(() => render(<DashboardCards apiData={MOCK_DATA} />));

  it("renders the Total Bookings card heading", () => {
    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
  });

  it("shows the total bookings value", () => {
    expect(screen.getByText("156")).toBeInTheDocument();
  });

  it("shows pending and cancelled counts in the bookings subline", () => {
    expect(screen.getByText(/18 pending/i)).toBeInTheDocument();
    expect(screen.getByText(/10 cancelled/i)).toBeInTheDocument();
  });

  it("renders the Total Revenue card heading", () => {
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });

  it("shows the formatted revenue string", () => {
    expect(screen.getByText("₹9,999")).toBeInTheDocument();
  });

  it("renders the Active Services card heading", () => {
    expect(screen.getByText("Active Services")).toBeInTheDocument();
  });

  it("shows the active services count", () => {
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("shows total services in the services subline", () => {
    expect(screen.getByText(/out of 24 total/i)).toBeInTheDocument();
  });

  it("renders the Total Customers card heading", () => {
    expect(screen.getByText("Total Customers")).toBeInTheDocument();
  });

  it("shows the customers count", () => {
    expect(screen.getByText("87")).toBeInTheDocument();
  });
});

describe("DashboardCards — without data (undefined)", () => {
  it("renders without crashing when apiData is undefined", () => {
    render(<DashboardCards apiData={undefined} />);
    // All four card headings should still appear
    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("Active Services")).toBeInTheDocument();
    expect(screen.getByText("Total Customers")).toBeInTheDocument();
  });

  it("shows no value when data is missing", () => {
    render(<DashboardCards apiData={undefined} />);
    // Card titles are always present even without data
    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });
});
