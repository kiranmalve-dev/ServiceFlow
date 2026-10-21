import { render, screen } from "@testing-library/react";
import { DataTable } from "./data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableFeatures } from "./data-table-features";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("./data-table-pagination", () => ({
  DataTablePagination: ({ totalCount }: { totalCount?: number }) => (
    <div data-testid="pagination">
      {totalCount !== undefined ? `${totalCount} total` : "client-pagination"}
    </div>
  ),
}));

// ── Fixture ───────────────────────────────────────────────────────────────────

interface Row { id: string; name: string; value: number }

const columns: ColumnDef<DataTableFeatures, Row, unknown>[] = [
  { accessorKey: "name",  header: "Name" },
  { accessorKey: "value", header: "Value" },
];

const rows: Row[] = [
  { id: "1", name: "Alpha", value: 10 },
  { id: "2", name: "Beta",  value: 20 },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DataTable — column headers", () => {
  it("renders all column headers", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /value/i })).toBeInTheDocument();
  });
});

describe("DataTable — data rows", () => {
  it("renders a row for each data item", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByRole("cell", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Beta"  })).toBeInTheDocument();
  });

  it("renders the correct values in cells", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByRole("cell", { name: "10" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "20" })).toBeInTheDocument();
  });
});

describe("DataTable — empty state", () => {
  it("shows 'No results.' when data array is empty", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("still renders the column headers when empty", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
  });
});

describe("DataTable — loading state", () => {
  it("shows the loading spinner when loading=true", () => {
    render(<DataTable columns={columns} data={[]} loading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("does not show 'No results.' while loading", () => {
    render(<DataTable columns={columns} data={[]} loading />);
    expect(screen.queryByText("No results.")).not.toBeInTheDocument();
  });

  it("does not render data rows while loading", () => {
    render(<DataTable columns={columns} data={rows} loading />);
    expect(screen.queryByRole("cell", { name: "Alpha" })).not.toBeInTheDocument();
  });
});

describe("DataTable — filters slot", () => {
  it("renders filtersSlot content above the table", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        filtersSlot={<input placeholder="Search…" />}
      />
    );
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("does not render the filters wrapper when filtersSlot is absent", () => {
    const { container } = render(<DataTable columns={columns} data={rows} />);
    // The wrapping flex div is only rendered when filtersSlot is truthy
    expect(container.querySelector(".flex.flex-wrap")).not.toBeInTheDocument();
  });
});

describe("DataTable — server-side pagination", () => {
  it("passes totalCount to the pagination component", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        totalCount={50}
        page={0}
        pageSize={10}
        onPageChange={jest.fn()}
      />
    );
    expect(screen.getByTestId("pagination")).toHaveTextContent("50 total");
  });
});
