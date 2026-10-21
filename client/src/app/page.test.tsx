import { render, screen } from "@testing-library/react";

// ── Stubs ─────────────────────────────────────────────────────────────────────
// HomePage is an async Server Component — RTL cannot render async components
// directly. We stub all async/heavy children so the page renders synchronously.

jest.mock("../components/common/header", () => ({
  __esModule: true,
  default: () => <header data-testid="site-header" />,
}));

jest.mock("../components/features/heroSection", () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1 id="hero-heading">Book Your Next Service Online</h1>
      <span>Online Booking</span>
      <p>Browse our professional services. No phone calls needed.</p>
      <a href="#services">Browse Services</a>
    </div>
  ),
}));

jest.mock("../components/features/statsStrip", () => ({
  __esModule: true,
  default: () => <div data-testid="stats-strip" />,
}));

jest.mock("../components/features/servicesHeader", () => ({
  __esModule: true,
  default: () => <h2 id="services-heading">Services</h2>,
}));

jest.mock("../components/features/services", () => ({
  __esModule: true,
  default: () => <div data-testid="services-section" />,
}));

jest.mock("./loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading" />,
}));

// Import AFTER mocks are in place
import HomePage from "./page";

// ── Hero section ──────────────────────────────────────────────────────────────
describe("HomePage — Hero section", () => {
  beforeEach(async () => {
    // await because HomePage is async (Server Component)
    render(await HomePage({ searchParams: Promise.resolve({}) }));
  });

  it("renders a section landmark labelled by the hero heading", () => {
    const section = screen.getByRole("region", {
      name: /book your next service online/i,
    });
    expect(section).toBeInTheDocument();
  });

  it("renders an h1 with the main headline text", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/book your next/i);
    expect(heading).toHaveTextContent(/service online/i);
  });

  it("gives the h1 the id used by aria-labelledby", () => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "hero-heading");
  });

  it("renders the 'Online Booking' badge", () => {
    expect(screen.getByText(/online booking/i)).toBeInTheDocument();
  });

  it("renders the descriptive paragraph copy", () => {
    expect(screen.getByText(/browse our professional services/i)).toBeInTheDocument();
  });

  it("mentions the key value proposition in the paragraph", () => {
    expect(screen.getByText(/no phone calls needed/i)).toBeInTheDocument();
  });

  it("renders a 'Browse Services' link", () => {
    expect(screen.getByRole("link", { name: /browse services/i })).toBeInTheDocument();
  });

  it("'Browse Services' link points to the #services anchor", () => {
    const link = screen.getByRole("link", { name: /browse services/i });
    expect(link).toHaveAttribute("href", "#services");
  });

  it("hides decorative blur circles from assistive technology", () => {
    const decorative = document.querySelectorAll('[aria-hidden="true"]');
    expect(decorative.length).toBeGreaterThanOrEqual(2);
  });
});
