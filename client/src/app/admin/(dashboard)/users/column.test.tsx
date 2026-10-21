import { render, screen, fireEvent } from "@testing-library/react";
import { getUserColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import type { User } from "./type";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ACTIVE_USER: User = {
  id: 1,
  name: "Alice Smith",
  email: "alice@example.com",
  phone: "9876543210",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const INACTIVE_USER: User = {
  id: 2,
  name: "Bob Jones",
  email: "bob@example.com",
  isActive: false,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

function renderTable(users: User[], onDelete = jest.fn()) {
  const columns = getUserColumns({ onDelete });
  render(<DataTable columns={columns} data={users} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UserColumns — column headers", () => {
  beforeEach(() => renderTable([ACTIVE_USER]));

  it("renders the Full Name header", () => {
    expect(
      screen.getByRole("columnheader", { name: /full name/i })
    ).toBeInTheDocument();
  });

  it("renders the Email header", () => {
    expect(
      screen.getByRole("columnheader", { name: /email/i })
    ).toBeInTheDocument();
  });

  it("renders the Phone header", () => {
    expect(
      screen.getByRole("columnheader", { name: /phone/i })
    ).toBeInTheDocument();
  });

  it("renders the Status header", () => {
    expect(
      screen.getByRole("columnheader", { name: /status/i })
    ).toBeInTheDocument();
  });

  it("renders the Joined header", () => {
    expect(
      screen.getByRole("columnheader", { name: /joined/i })
    ).toBeInTheDocument();
  });

  it("renders the Actions header", () => {
    expect(
      screen.getByRole("columnheader", { name: /actions/i })
    ).toBeInTheDocument();
  });
});

describe("UserColumns — row data — active user", () => {
  beforeEach(() => renderTable([ACTIVE_USER]));

  it("renders the user name", () => {
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders the user email", () => {
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("renders the phone number", () => {
    expect(screen.getByText("9876543210")).toBeInTheDocument();
  });

  it("shows 'Active' badge for an active user", () => {
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders the joined date", () => {
    // toLocaleDateString("en-IN") → locale-formatted date
    const cell = screen.getByText(
      new Date("2026-01-01T00:00:00.000Z").toLocaleDateString("en-IN")
    );
    expect(cell).toBeInTheDocument();
  });
});

describe("UserColumns — row data — inactive user", () => {
  beforeEach(() => renderTable([INACTIVE_USER]));

  it("shows 'Inactive' badge for an inactive user", () => {
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("renders '—' when phone is absent", () => {
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("UserColumns — Delete action", () => {
  it("renders the Delete button", () => {
    renderTable([ACTIVE_USER]);
    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("calls onDelete with the correct user when Delete is clicked", () => {
    const onDelete = jest.fn();
    renderTable([ACTIVE_USER], onDelete);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(ACTIVE_USER);
  });

  it("calls onDelete for the correct row when multiple users exist", () => {
    const onDelete = jest.fn();
    renderTable([ACTIVE_USER, INACTIVE_USER], onDelete);
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    fireEvent.click(deleteButtons[1]); // click second row's Delete
    expect(onDelete).toHaveBeenCalledWith(INACTIVE_USER);
  });
});

describe("UserColumns — empty state", () => {
  it("shows 'No results.' when no users are provided", () => {
    renderTable([]);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
});
