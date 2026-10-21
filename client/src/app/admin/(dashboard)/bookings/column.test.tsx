import { render, screen, fireEvent } from "@testing-library/react";
import { getBookingColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import type { Booking } from "./type";
import { messages } from "@/src/i18";

// ── Stubs ─────────────────────────────────────────────────────────────────────

// Stub Radix Select — the full component needs a browser pointer-events stack.
// Renders a plain <select> that is easy to assert and interact with.
// Only sets data-testid="status-select" when it's the booking status select
// (identified by the placeholder "Move to…") — prevents collision with the
// DataTable pagination select which also uses this stub.
jest.mock("@/src/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
  }: {
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue:   ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem:    ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_BOOKING: Booking = {
  id: "booking-001",
  status: "PENDING",
  scheduledAt: "2026-12-01T10:00:00.000Z",
  address: "123 Main St, Tel Aviv",
  notes: null,
  quotedPrice: 350,
  quotedService: "Cleaning",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  service: { id: "svc-1", name: "Deep Cleaning", category: "Cleaning", duration: 90 },
  user: { id: 1, name: "Alice Smith", email: "alice@example.com" },
};

function renderTable(
  booking: Booking,
  onStatusChange = jest.fn()
) {
  const columns = getBookingColumns({ onStatusChange, msgs: messages.en });
  render(<DataTable columns={columns} data={[booking]} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BookingColumns — customer cell", () => {
  it("renders customer name", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders customer email", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });
});

describe("BookingColumns — service cell", () => {
  it("renders service name", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("Deep Cleaning")).toBeInTheDocument();
  });

  it("renders service category", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
  });
});

describe("BookingColumns — price cell", () => {
  it("renders the quoted price with ₹ symbol", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("₹350")).toBeInTheDocument();
  });
});

describe("BookingColumns — status badge", () => {
  it("renders 'Pending' badge for PENDING booking", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders 'In Progress' badge for IN_PROGRESS booking", () => {
    renderTable({ ...BASE_BOOKING, status: "IN_PROGRESS" });
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders 'Completed' badge for COMPLETED booking", () => {
    renderTable({ ...BASE_BOOKING, status: "COMPLETED" });
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

describe("BookingColumns — Change Status dropdown", () => {
  it("shows 'No actions' for COMPLETED (terminal) booking", () => {
    renderTable({ ...BASE_BOOKING, status: "COMPLETED" });
    expect(screen.getByText(/no actions/i)).toBeInTheDocument();
    // No "Move to…" placeholder means no status select rendered
    expect(screen.queryByText("Move to…")).not.toBeInTheDocument();
  });

  it("shows 'No actions' for CANCELLED (terminal) booking", () => {
    renderTable({ ...BASE_BOOKING, status: "CANCELLED" });
    expect(screen.getByText(/no actions/i)).toBeInTheDocument();
  });

  function getStatusSelect() {
    // Find the select whose first option text is "Move to…"
    const selects = screen.getAllByRole("combobox");
    return selects.find((s) =>
      s.querySelector("option")?.textContent === "Move to…"
    ) as HTMLSelectElement;
  }

  it("renders the select for PENDING with only CONFIRMED and CANCELLED options", () => {
    renderTable(BASE_BOOKING);
    const select = getStatusSelect();
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("CONFIRMED");
    expect(options).toContain("CANCELLED");
    expect(options).not.toContain("COMPLETED");
    expect(options).not.toContain("IN_PROGRESS");
  });

  it("renders only IN_PROGRESS and CANCELLED for CONFIRMED booking", () => {
    renderTable({ ...BASE_BOOKING, status: "CONFIRMED" });
    const select = getStatusSelect();
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("IN_PROGRESS");
    expect(options).toContain("CANCELLED");
    expect(options).not.toContain("COMPLETED");
    expect(options).not.toContain("PENDING");
  });

  it("renders only COMPLETED for IN_PROGRESS booking", () => {
    renderTable({ ...BASE_BOOKING, status: "IN_PROGRESS" });
    const select = getStatusSelect();
    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("COMPLETED");
    expect(options).not.toContain("PENDING");
    expect(options).not.toContain("CANCELLED");
  });

  it("calls onStatusChange with correct args when a status is selected", () => {
    const onStatusChange = jest.fn();
    const columns = getBookingColumns({ onStatusChange, msgs: messages.en });
    render(<DataTable columns={columns} data={[BASE_BOOKING]} />);
    const select = getStatusSelect();
    fireEvent.change(select, { target: { value: "CONFIRMED" } });
    expect(onStatusChange).toHaveBeenCalledWith("booking-001", "CONFIRMED");
  });
});

describe("BookingColumns — address cell", () => {
  it("renders the address", () => {
    renderTable(BASE_BOOKING);
    expect(screen.getByText("123 Main St, Tel Aviv")).toBeInTheDocument();
  });
});
