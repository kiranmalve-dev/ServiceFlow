import { render, screen, fireEvent } from "@testing-library/react";
import { DataTablePagination } from "./data-table-pagination";
import type { ReactTable, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "./data-table-features";

// ── Table mock factory ────────────────────────────────────────────────────────
// Build the minimal ReactTable shape DataTablePagination needs.

function makeTable(overrides: {
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  selectedRows?: number;
  totalRows?: number;
} = {}): ReactTable<DataTableFeatures, RowData> {
  const {
    pageIndex  = 0,
    pageSize   = 10,
    pageCount  = 5,
    selectedRows = 0,
    totalRows    = 10,
  } = overrides;

  return {
    state: { pagination: { pageIndex, pageSize } },
    getPageCount: () => pageCount,
    setPageIndex: jest.fn(),
    setPageSize:  jest.fn(),
    previousPage: jest.fn(),
    nextPage:     jest.fn(),
    getFilteredSelectedRowModel: () => ({ rows: Array(selectedRows).fill({}) }),
    getFilteredRowModel:         () => ({ rows: Array(totalRows).fill({}) }),
  } as unknown as ReactTable<DataTableFeatures, RowData>;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("DataTablePagination — server-side mode", () => {
  it("shows total record count", () => {
    render(
      <DataTablePagination
        table={makeTable()}
        totalCount={47}
        serverPage={0}
        serverPageSize={10}
      />
    );
    expect(screen.getByText(/47 total record/i)).toBeInTheDocument();
  });

  it("pluralises 'record' for count > 1", () => {
    render(
      <DataTablePagination
        table={makeTable()}
        totalCount={10}
        serverPage={0}
        serverPageSize={10}
      />
    );
    expect(screen.getByText(/records/i)).toBeInTheDocument();
  });

  it("uses singular 'record' for count = 1", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageCount: 1 })}
        totalCount={1}
        serverPage={0}
        serverPageSize={10}
      />
    );
    expect(screen.getByText("1 total record")).toBeInTheDocument();
  });

  it("shows current page and total pages", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageCount: 5 })}
        totalCount={50}
        serverPage={2}
        serverPageSize={10}
      />
    );
    // serverPage is 0-indexed so page 2 → "Page 3 of 5"
    expect(screen.getByText("Page 3 of 5")).toBeInTheDocument();
  });

  it("disables Prev buttons on first page", () => {
    render(
      <DataTablePagination
        table={makeTable()}
        totalCount={30}
        serverPage={0}
        serverPageSize={10}
      />
    );
    expect(
      screen.getByRole("button", { name: /previous page/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /first page/i })
    ).toBeDisabled();
  });

  it("disables Next buttons on last page", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageCount: 3 })}
        totalCount={30}
        serverPage={2}
        serverPageSize={10}
      />
    );
    expect(
      screen.getByRole("button", { name: /next page/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /last page/i })
    ).toBeDisabled();
  });

  it("enables Prev buttons when not on first page", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageCount: 3 })}
        totalCount={30}
        serverPage={1}
        serverPageSize={10}
      />
    );
    expect(
      screen.getByRole("button", { name: /previous page/i })
    ).not.toBeDisabled();
  });

  it("enables Next buttons when not on last page", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageCount: 3 })}
        totalCount={30}
        serverPage={0}
        serverPageSize={10}
      />
    );
    expect(
      screen.getByRole("button", { name: /next page/i })
    ).not.toBeDisabled();
  });

  it("calls previousPage when Prev button is clicked", () => {
    const table = makeTable({ pageCount: 3 });
    render(
      <DataTablePagination
        table={table}
        totalCount={30}
        serverPage={1}
        serverPageSize={10}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /previous page/i }));
    expect(table.previousPage).toHaveBeenCalledTimes(1);
  });

  it("calls nextPage when Next button is clicked", () => {
    const table = makeTable({ pageCount: 3 });
    render(
      <DataTablePagination
        table={table}
        totalCount={30}
        serverPage={0}
        serverPageSize={10}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(table.nextPage).toHaveBeenCalledTimes(1);
  });

  it("calls setPageIndex(0) when First button is clicked", () => {
    const table = makeTable({ pageCount: 3 });
    render(
      <DataTablePagination
        table={table}
        totalCount={30}
        serverPage={2}
        serverPageSize={10}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /first page/i }));
    expect(table.setPageIndex).toHaveBeenCalledWith(0);
  });

  it("calls setPageIndex(pageCount-1) when Last button is clicked", () => {
    const table = makeTable({ pageCount: 3 });
    render(
      <DataTablePagination
        table={table}
        totalCount={30}
        serverPage={0}
        serverPageSize={10}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /last page/i }));
    expect(table.setPageIndex).toHaveBeenCalledWith(2);
  });

  it("shows the Rows-per-page selector with current value", () => {
    render(
      <DataTablePagination
        table={makeTable({ pageSize: 20 })}
        totalCount={100}
        serverPage={0}
        serverPageSize={20}
      />
    );
    expect(screen.getByText("Rows per page")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});

describe("DataTablePagination — client-side mode", () => {
  it("shows selected / total rows text", () => {
    render(
      <DataTablePagination
        table={makeTable({ selectedRows: 2, totalRows: 10 })}
      />
    );
    expect(screen.getByText(/2 of 10 row/i)).toBeInTheDocument();
  });
});
