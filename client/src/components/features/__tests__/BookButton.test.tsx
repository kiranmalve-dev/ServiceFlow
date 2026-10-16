/**
 * BookButton.test.tsx
 *
 * Tests for the BookButton (serviceRedirect) component:
 *  - authenticated users get a direct <Link> to the service page
 *  - unauthenticated users get a button that opens the LoginDialog
 *  - LoginDialog closes after successful login and onSuccess fires
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Mock next/navigation (used by BookButton's router.push)
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/link — render as plain <a> so href is testable
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

// Auth store — start unauthenticated, allow override per test
let mockIsAuthenticated = false;
jest.mock("@/src/store/customerAuthStore", () => ({
  useCustomerAuthStore: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

// LoginDialog — lightweight stub that exposes open state for assertions
const mockOnSuccess = jest.fn();
jest.mock("../loginDialog", () => ({
  __esModule: true,
  default: ({ open, onOpenChange, onSuccess }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess?: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="Login dialog">
        <button onClick={() => { onSuccess?.(); onOpenChange(false); }}>
          Mock Sign in
        </button>
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    ) : null,
}));

// Import AFTER mocks are set up
import BookButton from "../serviceRedirect";

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderButton(
  props = { serviceId: "svc-1", serviceName: "Deep Clean" }
) {
  return render(<BookButton {...props} />);
}

beforeEach(() => {
  mockIsAuthenticated = false;
  mockPush.mockClear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BookButton — authenticated user", () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
  });

  it("renders a link (not a button) when authenticated", () => {
    renderButton();
    expect(screen.getByRole("link", { name: /book deep clean/i })).toBeInTheDocument();
  });

  it("link points to the correct service detail URL", () => {
    renderButton();
    const link = screen.getByRole("link", { name: /book deep clean/i });
    expect(link).toHaveAttribute("href", "/customer/services/svc-1");
  });

  it("does not render a dialog trigger button", () => {
    renderButton();
    expect(screen.queryByRole("button", { name: /book now/i })).not.toBeInTheDocument();
  });
});

describe("BookButton — unauthenticated user", () => {
  it("renders a 'Book Now' button (not a link)", () => {
    renderButton();
    expect(screen.getByRole("button", { name: /book deep clean/i })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not open the login dialog initially", () => {
    renderButton();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the login dialog when Book Now is clicked", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: /book deep clean/i }));

    expect(screen.getByRole("dialog", { name: /login dialog/i })).toBeInTheDocument();
  });

  it("closes the dialog when the Close button is clicked", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: /book deep clean/i }));
    await user.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates to the service page after successful login", async () => {
    const user = userEvent.setup();
    renderButton({ serviceId: "svc-42", serviceName: "Pipe Fix" });

    await user.click(screen.getByRole("button", { name: /book pipe fix/i }));
    await user.click(screen.getByRole("button", { name: /mock sign in/i }));

    expect(mockPush).toHaveBeenCalledWith("/customer/services/svc-42");
  });

  it("closes the dialog after successful login", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: /book deep clean/i }));
    await user.click(screen.getByRole("button", { name: /mock sign in/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
