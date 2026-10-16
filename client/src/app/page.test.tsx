import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

// ── Hero section ──────────────────────────────────────────────────────────────
describe("HomePage — Hero section", () => {
  beforeEach(() => {
    render(<HomePage />);
  });

  // ── Landmark / ARIA ────────────────────────────────────────────────────────

  it("renders a section landmark labelled by the hero heading", () => {
    // The <section> uses aria-labelledby="hero-heading", so the accessible
    // name of the region equals the heading text.
    const section = screen.getByRole("region", {
      name: /book your next service online/i,
    });
    expect(section).toBeInTheDocument();
  });

  // ── Heading ────────────────────────────────────────────────────────────────

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

  // ── Badge ──────────────────────────────────────────────────────────────────

  it("renders the 'Online Booking' badge", () => {
    expect(
      screen.getByText(/online booking/i)
    ).toBeInTheDocument();
  });

  // ── Body copy ──────────────────────────────────────────────────────────────

  it("renders the descriptive paragraph copy", () => {
    expect(
      screen.getByText(/browse our professional services/i)
    ).toBeInTheDocument();
  });

  it("mentions the key value proposition in the paragraph", () => {
    const para = screen.getByText(/no phone calls needed/i);
    expect(para).toBeInTheDocument();
  });

  // ── Browse Services link ───────────────────────────────────────────────────

  it("renders a 'Browse Services' link", () => {
    const link = screen.getByRole("link", { name: /browse services/i });
    expect(link).toBeInTheDocument();
  });

  it("'Browse Services' link points to the #services anchor", () => {
    const link = screen.getByRole("link", { name: /browse services/i });
    expect(link).toHaveAttribute("href", "#services");
  });

  // ── Decorative elements ────────────────────────────────────────────────────

  it("hides decorative blur circles from assistive technology", () => {
    // Both decorative <div>s carry aria-hidden="true".
    // querySelectorAll is used because aria-hidden elements are intentionally
    // excluded from the accessible tree (getByRole / getByText won't find them).
    const decorative = document
      .querySelectorAll('[aria-hidden="true"]');
    expect(decorative.length).toBeGreaterThanOrEqual(2);
  });
});
