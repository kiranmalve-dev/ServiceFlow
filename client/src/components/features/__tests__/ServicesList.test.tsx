/**
 * ServicesList.test.tsx
 *
 * Tests for the client-side ServicesList component:
 *  - initial render
 *  - search filter
 *  - category filter pills
 *  - sort behaviour (price low → high is the default)
 *  - empty-state when filters produce no results
 *  - load-more pagination
 */

import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServicesList, { type Service } from "../serviceList";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// BookButton uses next/link and reads auth state — mock it with a simple anchor
jest.mock("../serviceRedirect", () => ({
  __esModule: true,
  default: ({ serviceName, serviceId }: { serviceName: string; serviceId: string }) => (
    <a href={`/customer/services/${serviceId}`}>Book {serviceName}</a>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeService = (overrides: Partial<Service> & { id: string }): Service => ({
  id: overrides.id,
  name:        overrides.name        ?? `Service ${overrides.id}`,
  description: overrides.description ?? `Description for service ${overrides.id}`,
  price:       overrides.price       ?? 100,
  duration:    overrides.duration    ?? 60,
  category:    overrides.category    ?? "Cleaning",
  badge:       overrides.badge       ?? null,
});

const SERVICES: Service[] = [
  makeService({ id: "1", name: "Deep Clean",    price: 50,  category: "Cleaning",   duration: 60  }),
  makeService({ id: "2", name: "Pipe Fix",      price: 200, category: "Plumbing",   duration: 90  }),
  makeService({ id: "3", name: "Garden Trim",   price: 80,  category: "Gardening",  duration: 45  }),
  makeService({ id: "4", name: "Wiring Check",  price: 150, category: "Electrical", duration: 120 }),
  makeService({ id: "5", name: "AC Service",    price: 300, category: "HVAC",       duration: 180 }),
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderList(services = SERVICES) {
  return render(<ServicesList services={services} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ServicesList — initial render", () => {
  it("renders all service cards when no filters are applied", () => {
    renderList();
    // Each card has an h3 with the service name
    SERVICES.forEach((s) => {
      expect(screen.getByRole("heading", { name: s.name })).toBeInTheDocument();
    });
  });

  it("shows the correct total count in the results summary", () => {
    renderList();
    expect(screen.getByText(`${SERVICES.length} services`)).toBeInTheDocument();
  });

  it("renders a 'Price: Low to High' sort option selected by default", () => {
    renderList();
    const sortSelect = screen.getByRole("combobox", { name: /sort services/i });
    expect((sortSelect as HTMLSelectElement).value).toBe("price-asc");
  });

  it("renders the category filter group", () => {
    renderList();
    expect(
      screen.getByRole("group", { name: /filter by category/i })
    ).toBeInTheDocument();
  });

  it("renders an 'All' pill that is active by default", () => {
    renderList();
    const allPill = screen.getByRole("button", { name: "All" });
    expect(allPill).toHaveAttribute("aria-pressed", "true");
  });

  it("renders one pill per unique category plus the All pill", () => {
    renderList();
    const uniqueCategories = [...new Set(SERVICES.map((s) => s.category))];
    // "All" + each category
    const pills = screen.getAllByRole("button", {
      // filter pills have aria-pressed
    }).filter((b) => b.hasAttribute("aria-pressed"));
    expect(pills).toHaveLength(uniqueCategories.length + 1);
  });
});

describe("ServicesList — search", () => {
  it("filters cards by service name (case-insensitive)", async () => {
    const user = userEvent.setup();
    renderList();

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "deep");

    expect(screen.getByRole("heading", { name: /deep clean/i })).toBeInTheDocument();
    // Other services must be gone
    expect(screen.queryByRole("heading", { name: /pipe fix/i })).not.toBeInTheDocument();
  });

  it("filters cards by description text", async () => {
    const user = userEvent.setup();
    const services = [
      makeService({ id: "a", name: "Alpha",  description: "special description here" }),
      makeService({ id: "b", name: "Beta",   description: "nothing interesting" }),
    ];
    render(<ServicesList services={services} />);

    await user.type(screen.getByRole("searchbox"), "special");

    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Beta" })).not.toBeInTheDocument();
  });

  it("shows the empty state when search matches nothing", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByRole("searchbox"), "zzznomatch");

    expect(screen.getByText(/no services match your filters/i)).toBeInTheDocument();
  });

  it("clears search when the × button is clicked", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByRole("searchbox"), "clean");
    // × button appears after typing
    const clearBtn = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearBtn);

    // All services should be visible again
    SERVICES.forEach((s) => {
      expect(screen.getByRole("heading", { name: s.name })).toBeInTheDocument();
    });
  });

  it("updates the results count label while filtering", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByRole("searchbox"), "pipe");
    expect(screen.getByText(/1 of 5 services/i)).toBeInTheDocument();
  });
});

describe("ServicesList — category filter", () => {
  it("shows only cards matching the clicked category", async () => {
    const user = userEvent.setup();
    renderList();

    const plumbingPill = screen.getByRole("button", { name: "Plumbing" });
    await user.click(plumbingPill);

    expect(screen.getByRole("heading", { name: /pipe fix/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /deep clean/i })).not.toBeInTheDocument();
  });

  it("marks the clicked category pill as pressed", async () => {
    const user = userEvent.setup();
    renderList();

    const pill = screen.getByRole("button", { name: "HVAC" });
    await user.click(pill);

    expect(pill).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the 'Clear filters' button when a category is active", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("button", { name: "Gardening" }));

    expect(screen.getByRole("button", { name: /clear filters/i })).toBeInTheDocument();
  });

  it("resets to 'All' when 'Clear filters' is clicked", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("button", { name: "Electrical" }));
    await user.click(screen.getByRole("button", { name: /clear filters/i }));

    // All services should reappear
    expect(screen.getByRole("heading", { name: /deep clean/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ServicesList — sorting", () => {
  it("default sort (price-asc) renders cheapest card first", () => {
    renderList();
    const headings = screen.getAllByRole("heading", { level: 3 });
    // Deep Clean (₪50) should appear before Pipe Fix (₪200)
    const deepIdx  = headings.findIndex((h) => h.textContent === "Deep Clean");
    const pipeIdx  = headings.findIndex((h) => h.textContent === "Pipe Fix");
    expect(deepIdx).toBeLessThan(pipeIdx);
  });

  it("price-desc renders most expensive card first", async () => {
    const user = userEvent.setup();
    renderList();

    const sortSelect = screen.getByRole("combobox", { name: /sort services/i });
    await user.selectOptions(sortSelect, "price-desc");

    const headings = screen.getAllByRole("heading", { level: 3 });
    // AC Service (₪300) should be first
    expect(headings[0]).toHaveTextContent("AC Service");
  });

  it("name-asc renders cards in alphabetical order", async () => {
    const user = userEvent.setup();
    renderList();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /sort services/i }),
      "name-asc"
    );

    const headings = screen.getAllByRole("heading", { level: 3 });
    const names = headings.map((h) => h.textContent ?? "");
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("shows the active sort label in the results summary", async () => {
    const user = userEvent.setup();
    renderList();

    await user.selectOptions(
      screen.getByRole("combobox", { name: /sort services/i }),
      "duration-asc"
    );

    expect(screen.getByText(/duration: shortest/i)).toBeInTheDocument();
  });
});

describe("ServicesList — load more", () => {
  function makeManyServices(count: number): Service[] {
    return Array.from({ length: count }, (_, i) =>
      makeService({ id: String(i + 1), name: `Service ${i + 1}`, price: i + 1 })
    );
  }

  it("shows at most 8 cards initially when there are more than 8 services", () => {
    render(<ServicesList services={makeManyServices(12)} />);
    const cards = screen.getAllByRole("heading", { level: 3 });
    expect(cards).toHaveLength(8);
  });

  it("shows a 'Load More' button when there are more than 8 services", () => {
    render(<ServicesList services={makeManyServices(10)} />);
    expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
  });

  it("reveals the next batch of cards when 'Load More' is clicked", async () => {
    const user = userEvent.setup();
    render(<ServicesList services={makeManyServices(10)} />);

    await user.click(screen.getByRole("button", { name: /load more/i }));

    // All 10 should now be visible
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
  });

  it("hides the 'Load More' button once all services are visible", async () => {
    const user = userEvent.setup();
    render(<ServicesList services={makeManyServices(10)} />);

    await user.click(screen.getByRole("button", { name: /load more/i }));

    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
    expect(screen.getByText(/all 10 services shown/i)).toBeInTheDocument();
  });

  it("does not show 'Load More' when all services fit in the first page", () => {
    render(<ServicesList services={makeManyServices(5)} />);
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });
});

describe("ServicesList — empty state", () => {
  it("shows a clear-all button in the empty state", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByRole("searchbox"), "xyzzy");

    // Two 'clear' buttons: one in the filter bar, one in the empty state panel
    const clearBtns = screen.getAllByRole("button", { name: /clear (all )?filters/i });
    expect(clearBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("clicking the empty-state clear button restores all services", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(screen.getByRole("searchbox"), "xyzzy");
    const [, emptyStateClear] = screen.getAllByRole("button", {
      name: /clear (all )?filters/i,
    });
    await user.click(emptyStateClear);

    SERVICES.forEach((s) =>
      expect(screen.getByRole("heading", { name: s.name })).toBeInTheDocument()
    );
  });
});
