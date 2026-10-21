import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ServicesPage from "./page";

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
  getServiceColumns: ({ onEdit, onDelete }: {
    onEdit: (s: { id: string; name: string }) => void;
    onDelete: (s: { id: string; name: string }) => void;
  }) => [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }: { row: { original: { id: string; name: string } } }) => (
        <span>{row.original.name}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: { id: string; name: string } } }) => (
        <>
          <button onClick={() => onEdit(row.original)}>Edit</button>
          <button onClick={() => onDelete(row.original)}>Delete</button>
        </>
      ),
    },
  ],
}));

jest.mock("./createServiceDialog", () => ({
  __esModule: true,
  default: ({
    open,
    onOpenChange,
    onCreated,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated?: (s: unknown) => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="Create service dialog">
        <button onClick={() => onCreated?.({ id: "new", name: "New Svc", category: "Cleaning", description: "desc", price: 100, duration: 30, isActive: true, createdAt: "", updatedAt: "" })}>
          Confirm Create
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

jest.mock("@/src/components/ui/select", () => ({
  Select: ({ onValueChange, children }: { onValueChange: (v: string | null) => void; children: React.ReactNode }) => (
    <select data-testid="status-select" onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue:   ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem:    ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_SERVICE = {
  id: "svc-1",
  name: "Deep Cleaning",
  category: "Cleaning",
  description: "A thorough clean.",
  price: 350,
  duration: 120,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const MOCK_META = { total: 1, page: 1, pageSize: 10, totalPages: 1 };

function mockApiOk(services = [MOCK_SERVICE]) {
  const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
  api.get.mockResolvedValue({ data: { data: services, meta: MOCK_META } });
}

// Render and wait for the initial fetch to settle inside act.
async function renderAndSettle(services = [MOCK_SERVICE]) {
  mockApiOk(services);
  render(<ServicesPage />);
  await waitFor(() =>
    services.length === 0
      ? expect(screen.getByText("No results.")).toBeInTheDocument()
      : expect(screen.getByText(services[0].name)).toBeInTheDocument()
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ServicesPage — initial render", () => {
  it("renders the Services heading", async () => {
    await renderAndSettle();
    expect(screen.getByRole("heading", { name: /admin\.services/i })).toBeInTheDocument();
  });

  it("renders the New Service button", async () => {
    await renderAndSettle();
    expect(screen.getByRole("button", { name: /admin\.newService/i })).toBeInTheDocument();
  });

  it("renders the subtitle", async () => {
    await renderAndSettle();
    expect(screen.getByText("admin.servicesSubtitle")).toBeInTheDocument();
  });
});

describe("ServicesPage — data fetch", () => {
  it("calls the services API on mount", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    expect(api.get).toHaveBeenCalledWith(
      "/services",
      expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
    );
  });

  it("renders service names after fetch", async () => {
    await renderAndSettle();
    expect(screen.getByText("Deep Cleaning")).toBeInTheDocument();
  });

  it("shows 'No results.' when API returns empty list", async () => {
    await renderAndSettle([]);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
});

describe("ServicesPage — filters", () => {
  it("renders the search input", async () => {
    await renderAndSettle();
    expect(screen.getByPlaceholderText(/search by name or category/i)).toBeInTheDocument();
  });

  it("renders the status filter dropdown", async () => {
    await renderAndSettle();
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("refetches with search param when search input changes", async () => {
    await renderAndSettle();
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.get.mockClear();

    fireEvent.change(screen.getByPlaceholderText(/search by name or category/i), {
      target: { value: "clean" },
    });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        "/services",
        expect.objectContaining({
          params: expect.objectContaining({ search: "clean", page: 1 }),
        })
      )
    );
  });

  it("shows the Clear button when search is active", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByPlaceholderText(/search by name or category/i), {
      target: { value: "clean" },
    });
    expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
  });

  it("hides the Clear button when no filters are active", async () => {
    await renderAndSettle();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("clears all filters when Clear is clicked", async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByPlaceholderText(/search by name or category/i), {
      target: { value: "clean" },
    });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByPlaceholderText(/search by name or category/i)).toHaveValue("");
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });
});

describe("ServicesPage — Create Service dialog", () => {
  it("opens the Create dialog when New Service is clicked", async () => {
    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /admin\.newService/i }));
    expect(screen.getByRole("dialog", { name: /create service dialog/i })).toBeInTheDocument();
  });

  it("closes the dialog when Close is clicked", async () => {
    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /admin\.newService/i }));
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog", { name: /create service dialog/i })).not.toBeInTheDocument();
  });

  it("adds the new service to the list on creation", async () => {
    await renderAndSettle([]);
    fireEvent.click(screen.getByRole("button", { name: /admin\.newService/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm create/i }));
    await waitFor(() => expect(screen.getByText("New Svc")).toBeInTheDocument());
  });
});

describe("ServicesPage — Delete service", () => {
  it("calls the delete API when Delete is confirmed", async () => {
    window.confirm = jest.fn(() => true);
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.delete.mockResolvedValue({ success: true });

    await renderAndSettle();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() =>
      expect(api.delete).toHaveBeenCalledWith("/admin/services/svc-1")
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
});
