import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UsersPage from "./page";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("@/src/lib/axiosIntercepter", () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/src/components/common/data-table", () => ({
  DataTable: ({
    columns,
    data,
    filtersSlot,
  }: {
    columns: Array<{
      accessorKey?: string;
      id?: string;
      cell?: (ctx: { row: { original: unknown } }) => React.ReactNode;
    }>;
    data: unknown[];
    filtersSlot?: React.ReactNode;
  }) => (
    <div>
      {filtersSlot}
      {data.length === 0 ? (
        <span>No results.</span>
      ) : (
        data.map((row, i) => (
          <div key={i}>
            {columns.map((col) => (
              <span key={col.accessorKey ?? col.id}>
                {col.cell ? col.cell({ row: { original: row } }) : null}
              </span>
            ))}
          </div>
        ))
      )}
    </div>
  ),
}));

jest.mock("@/src/store/localeStore", () => ({
  useLocaleStore: () => ({ msgs: {} }),
}));

jest.mock("@/src/i18", () => ({
  t: (_msgs: unknown, key: string) => key,
}));

jest.mock("@/src/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

jest.mock("./column", () => ({
  getUserColumns: ({
    onDelete,
  }: {
    onDelete: (u: { id: number; name: string }) => void;
  }) => [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }: { row: { original: { id: number; name: string } } }) => (
        <span>{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: { original: { email: string } } }) => (
        <span>{row.original.email}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: { row: { original: { isActive: boolean } } }) => (
        <span>{row.original.isActive ? "Active" : "Inactive"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: { id: number; name: string } } }) => (
        <button onClick={() => onDelete(row.original)}>Delete</button>
      ),
    },
  ],
}));

jest.mock("@/src/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
  }: {
    onValueChange: (v: string | null) => void;
    children: React.ReactNode;
  }) => (
    <select
      data-testid="status-select"
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue:   ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem:    ({ value, children }: { value: string; children: React.ReactNode }) =>
    <option value={value}>{children}</option>,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 1,
  name: "Alice Smith",
  email: "alice@example.com",
  phone: "9876543210",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const MOCK_INACTIVE_USER = {
  id: 2,
  name: "Bob Jones",
  email: "bob@example.com",
  phone: "9876543210",
  isActive: false,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

const MOCK_META = { total: 1, page: 1, pageSize: 10, totalPages: 1 };

function mockApiOk(users = [MOCK_USER]) {
  const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
  api.get.mockResolvedValue({ data: { data: users, meta: MOCK_META } });
}

// Render and wait for the initial fetch to settle inside act.
async function renderAndSettle(users = [MOCK_USER]) {
  mockApiOk(users);
  render(<UsersPage />);
  // waitFor flushes all pending microtasks inside act — no act() warnings
  await waitFor(() =>
    users.length === 0
      ? expect(screen.getByText("No results.")).toBeInTheDocument()
      : expect(screen.getByText(users[0].name)).toBeInTheDocument()
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UsersPage — initial render", () => {
  it("renders the User Management heading", async () => {
    await renderAndSettle();
    expect(screen.getByRole("heading", { name: /admin\.users/i })).toBeInTheDocument();
  });

  it("renders the subtitle", async () => {
    await renderAndSettle();
    expect(screen.getByText("admin.usersSubtitle")).toBeInTheDocument();
  });

  it("renders the search input", async () => {
    await renderAndSettle();
    expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
  });

  it("renders the status filter dropdown", async () => {
    await renderAndSettle();
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("does not show the Clear button when no filters are active", async () => {
    await renderAndSettle();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });
});

describe("UsersPage — data fetch", () => {
  it("calls the users API on mount", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    expect(api.get).toHaveBeenCalledWith(
      "/admin/users",
      expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
    );
  });

  it("renders user names after a successful fetch", async () => {
    await renderAndSettle();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders user email after a successful fetch", async () => {
    await renderAndSettle();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows 'Active' badge for an active user", async () => {
    await renderAndSettle();
    // Use getAllByText — "Active" also appears as a <option> in the Select stub
    const matches = screen.getAllByText("Active");
    expect(matches.some((el) => el.tagName === "SPAN")).toBe(true);
  });

  it("shows 'Inactive' badge for an inactive user", async () => {
    await renderAndSettle([MOCK_INACTIVE_USER]);
    // Use getAllByText — "Inactive" also appears as a <option> in the Select stub
    const matches = screen.getAllByText("Inactive");
    expect(matches.some((el) => el.tagName === "SPAN")).toBe(true);
  });

  it("renders multiple users", async () => {
    await renderAndSettle([MOCK_USER, MOCK_INACTIVE_USER]);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("shows 'No results.' when API returns an empty list", async () => {
    await renderAndSettle([]);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
});

describe("UsersPage — search filter", () => {
  it("refetches with search param when search input changes", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.get.mockClear();

    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "alice" },
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/admin/users",
        expect.objectContaining({
          params: expect.objectContaining({ search: "alice", page: 1 }),
        })
      )
    );
  });

  it("shows the Clear button when search is active", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "alice" },
    });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("clears the search field when Clear is clicked", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByPlaceholderText(/search by name or email/i)).toHaveValue("");
  });

  it("hides the Clear button after clearing", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), {
      target: { value: "alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });
});

describe("UsersPage — status filter", () => {
  it("passes isActive=true param when Active is selected", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.get.mockClear();

    fireEvent.change(screen.getByTestId("status-select"), { target: { value: "true" } });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/admin/users",
        expect.objectContaining({
          params: expect.objectContaining({ isActive: "true", page: 1 }),
        })
      )
    );
  });

  it("passes isActive=false param when Inactive is selected", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.get.mockClear();

    fireEvent.change(screen.getByTestId("status-select"), { target: { value: "false" } });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/admin/users",
        expect.objectContaining({
          params: expect.objectContaining({ isActive: "false", page: 1 }),
        })
      )
    );
  });

  it("shows the Clear button when a status filter is active", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByTestId("status-select"), { target: { value: "true" } });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });
});

describe("UsersPage — delete user", () => {
  it("calls the delete API when Delete is confirmed", async () => {
    window.confirm = jest.fn(() => true);
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.delete.mockResolvedValue({ success: true });

    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() =>
      expect(api.delete).toHaveBeenCalledWith(`/admin/users/${MOCK_USER.id}`)
    );
  });

  it("does not call the delete API when Delete is cancelled", async () => {
    window.confirm = jest.fn(() => false);
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.delete.mockClear();

    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(api.delete).not.toHaveBeenCalled();
  });

  it("refetches users after a successful delete", async () => {
    window.confirm = jest.fn(() => true);
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.delete.mockResolvedValue({ success: true });

    await renderAndSettle();
    api.get.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  });

  it("shows the confirm dialog with the user's name", async () => {
    const confirmSpy = jest.fn(() => false);
    window.confirm = confirmSpy;

    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("Alice Smith"));
  });
});
