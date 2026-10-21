import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyBookingPage from "./page";
import { useLocaleStore } from "../../../store/localeStore";
import { useCustomerAuthStore } from "../../../store/customerAuthStore";
import { getMyBookings } from "@/src/lib/bookings";

// ── Next.js stubs ─────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

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

// ── Store / lib stubs ─────────────────────────────────────────────────────────

jest.mock("../../../store/localeStore", () => ({
  useLocaleStore: jest.fn(),
}));

jest.mock("../../../store/customerAuthStore", () => ({
  useCustomerAuthStore: jest.fn(),
}));

jest.mock("../../../i18", () => ({
  t: (_msgs: unknown, key: string) => key,
}));

jest.mock("@/src/lib/bookings", () => ({
  getMyBookings: jest.fn(),
}));

jest.mock("@/src/lib/axiosIntercepter", () => ({
  __esModule: true,
  default: { patch: jest.fn() },
}));

// ── Shared fixtures ───────────────────────────────────────────────────────────

const MOCK_BOOKING = {
  id: "booking-abc-12345678",
  status: "PENDING" as const,
  scheduledAt: "2026-12-01T10:00:00.000Z",
  address: "123 Main St, Tel Aviv",
  notes: "",
  quotedPrice: 250,
  quotedService: "Cleaning",
  createdAt: "2026-11-01T08:00:00.000Z",
  updatedAt: "2026-11-01T08:00:00.000Z",
  service: { id: "svc-1", name: "Deep Cleaning", category: "Cleaning", duration: 90 },
  user:    { id: 1, name: "Alice", email: "alice@example.com" },
};

function setupStores(isAuthenticated = true) {
  jest.mocked(useLocaleStore).mockReturnValue({
    msgs: {},
  } as ReturnType<typeof useLocaleStore>);

  jest.mocked(useCustomerAuthStore).mockReturnValue({
    isAuthenticated,
    user: isAuthenticated
      ? { id: 1, name: "Alice", email: "alice@example.com", role: "customer" }
      : null,
    setAuth: jest.fn(),
    clearAuth: jest.fn(),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MyBookingPage — loading state", () => {
  beforeEach(() => {
    setupStores();
    // keep the promise pending so loading UI stays visible
    jest.mocked(getMyBookings).mockReturnValue(new Promise(() => {}));
  });

  it("renders the page heading", async () => {
    render(<MyBookingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows the loading skeleton while fetching", async () => {
    render(<MyBookingPage />);
    expect(
      screen.getByRole("list", { name: /loading bookings/i })
    ).toBeInTheDocument();
  });

  it("hides the refresh button while loading", async () => {
    render(<MyBookingPage />);
    expect(
      screen.queryByRole("button", { name: /refresh bookings/i })
    ).not.toBeInTheDocument();
  });
});

describe("MyBookingPage — empty state", () => {
  beforeEach(async () => {
    setupStores();
    jest.mocked(getMyBookings).mockResolvedValue({ bookings: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } });
    render(<MyBookingPage />);
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: /loading/i })).not.toBeInTheDocument()
    );
  });

  it("shows the no-bookings message", () => {
    expect(screen.getByText("myBooking.noBookings")).toBeInTheDocument();
  });

  it("shows a 'Browse Services' link pointing to /customer/services", () => {
    const link = screen.getByRole("link", { name: "myBooking.browseServices" });
    expect(link).toHaveAttribute("href", "/customer/services");
  });

  it("shows the refresh button", () => {
    expect(
      screen.getByRole("button", { name: /refresh bookings/i })
    ).toBeInTheDocument();
  });
});

describe("MyBookingPage — error state", () => {
  beforeEach(async () => {
    setupStores();
    jest.mocked(getMyBookings).mockRejectedValue({ message: "Network error" });
    render(<MyBookingPage />);
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: /loading/i })).not.toBeInTheDocument()
    );
  });

  it("shows the error message in an alert", () => {
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });

  it("renders a Retry button inside the alert", () => {
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("retries fetching when Retry is clicked", async () => {
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    );
  });
});

describe("MyBookingPage — booking list", () => {
  beforeEach(async () => {
    setupStores();
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [MOCK_BOOKING],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    });
    render(<MyBookingPage />);
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: /loading/i })).not.toBeInTheDocument()
    );
  });

  it("renders the service name as a heading", () => {
    expect(
      screen.getByRole("heading", { name: /deep cleaning/i })
    ).toBeInTheDocument();
  });

  it("renders the booking reference ID suffix", () => {
    // last 8 chars of 'booking-abc-12345678' uppercased
    expect(screen.getByText(/#12345678/i)).toBeInTheDocument();
  });

  it("renders the quoted price", () => {
    expect(screen.getByText(/₹250/)).toBeInTheDocument();
  });

  it("renders the service category", () => {
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
  });

  it("renders the duration", () => {
    expect(screen.getByText(/90 min/i)).toBeInTheDocument();
  });

  it("renders a PENDING status badge", () => {
    expect(
      screen.getByRole("generic", { name: /status: myBooking\.status\.pending/i })
    ).toBeInTheDocument();
  });

  it("renders the Cancel Booking button for a PENDING booking", () => {
    expect(
      screen.getByRole("button", { name: "myBooking.cancel" })
    ).toBeInTheDocument();
  });

  it("calls the cancel API when Cancel is clicked", async () => {
    const apiMock = jest.requireMock("@/src/lib/axiosIntercepter").default as { patch: jest.Mock };
    apiMock.patch.mockResolvedValue({ success: true });
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    });
    fireEvent.click(screen.getByRole("button", { name: "myBooking.cancel" }));
    await waitFor(() =>
      expect(apiMock.patch).toHaveBeenCalledWith(
        `/bookings/${MOCK_BOOKING.id}/cancel`
      )
    );
  });
});

describe("MyBookingPage — CONFIRMED booking", () => {
  it("shows the Cancel button for a CONFIRMED booking", async () => {
    setupStores();
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [{ ...MOCK_BOOKING, status: "CONFIRMED" as const }],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    });
    render(<MyBookingPage />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "myBooking.cancel" })).toBeInTheDocument()
    );
  });

  it("does NOT show Cancel for a COMPLETED booking", async () => {
    setupStores();
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [{ ...MOCK_BOOKING, status: "COMPLETED" as const }],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    });
    render(<MyBookingPage />);
    await waitFor(() =>
      expect(screen.queryByRole("list", { name: /loading/i })).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole("button", { name: "myBooking.cancel" })
    ).not.toBeInTheDocument();
  });
});

describe("MyBookingPage — unauthenticated", () => {
  it("redirects to / when user is not authenticated", () => {
    const replace = jest.fn();
    jest.mocked(useLocaleStore).mockReturnValue({ msgs: {} } as ReturnType<typeof useLocaleStore>);
    jest.mocked(useCustomerAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });
    jest.mocked(getMyBookings).mockResolvedValue({
      bookings: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    });

    const mockUseRouter = jest.requireMock("next/navigation").useRouter;
    mockUseRouter.mockReturnValue({ replace });

    render(<MyBookingPage />);
    expect(replace).toHaveBeenCalledWith("/");
  });
});
