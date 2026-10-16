
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSetAuth = jest.fn();
let mockIsAuthenticated = false;

jest.mock("@/src/store/customerAuthStore", () => ({
  useCustomerAuthStore: () => ({
    setAuth: mockSetAuth,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

const mockLoginWithPortal = jest.fn();
jest.mock("@/src/lib/auth", () => ({
  loginWithPortal: (...args: unknown[]) => mockLoginWithPortal(...args),
}));

// Dialog primitive — base-ui renders portals into document.body.
// next/jest with jsdom handles this, but we need a simplified dialog stub
// because base-ui's Dialog uses browser APIs (ResizeObserver, etc.).
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle:   ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

import LoginDialog from "../loginDialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  open: true,
  onOpenChange: jest.fn(),
};

function renderDialog(props?: Partial<typeof DEFAULT_PROPS & { onSuccess?: () => void; callbackUrl?: string }>) {
  return render(<LoginDialog {...DEFAULT_PROPS} {...props} />);
}

const VALID_USER = {
  data: { id: 1, email: "test@example.com", name: "Test User", role: "customer" },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAuthenticated = false;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("LoginDialog — visibility", () => {
  it("renders the form when open=true", () => {
    renderDialog({ open: true });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders nothing when open=false", () => {
    renderDialog({ open: false });
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
  });

  it("shows the dialog title 'Welcome back'", () => {
    renderDialog();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("shows the 'Sign in to manage your bookings' description", () => {
    renderDialog();
    expect(screen.getByText(/sign in to manage your bookings/i)).toBeInTheDocument();
  });
});

describe("LoginDialog — form fields", () => {
  it("email input has type=email", () => {
    renderDialog();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute("type", "email");
  });

  it("password input starts with type=password (hidden)", () => {
    renderDialog();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
  });

  it("has a submit button labelled 'Sign in'", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("has a link to the register page", () => {
    renderDialog();
    const link = screen.getByRole("link", { name: /sign up free/i });
    expect(link).toHaveAttribute("href", "/customer/register");
  });
});

describe("LoginDialog — password visibility toggle", () => {
  it("toggles password field to text when show-password is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    const toggle = screen.getByRole("button", { name: /show password/i });
    await user.click(toggle);

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "text");
  });

  it("toggles back to password type on a second click", async () => {
    const user = userEvent.setup();
    renderDialog();

    const toggle = screen.getByRole("button", { name: /show password/i });
    await user.click(toggle);
    await user.click(screen.getByRole("button", { name: /hide password/i }));

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");
  });
});

describe("LoginDialog — client-side validation", () => {
  it("shows 'Email is required' when submitting with empty email", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows 'Password is required' when submitting with empty password", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows invalid-email message for a non-email string", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });
  });

  it("does NOT call loginWithPortal when validation fails", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => screen.getByText(/email is required/i));
    expect(mockLoginWithPortal).not.toHaveBeenCalled();
  });
});

describe("LoginDialog — successful login", () => {
  beforeEach(() => {
    mockLoginWithPortal.mockResolvedValue(VALID_USER);
  });

  async function fillAndSubmit() {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));
    return user;
  }

  it("calls loginWithPortal with correct payload", async () => {
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockLoginWithPortal).toHaveBeenCalledWith({
        email:    "test@example.com",
        password: "password123",
        portal:   "customer",
      });
    });
  });

  it("calls setAuth with the returned user data", async () => {
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(VALID_USER.data);
    });
  });

  it("calls onOpenChange(false) to close the dialog after login", async () => {
    const onOpenChange = jest.fn();
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("fires onSuccess callback after login", async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={jest.fn()} onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("navigates to callbackUrl when no onSuccess is provided", async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={jest.fn()} callbackUrl="/customer/services/abc" />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/customer/services/abc")
    );
  });
});

describe("LoginDialog — API error handling", () => {
  it("displays the error message returned by the API", async () => {
    mockLoginWithPortal.mockRejectedValue({
      status: 401,
      message: "Invalid email or password. Please try again.",
    });

    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/email address/i), "bad@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });

  it("clears the API error when the user starts typing again", async () => {
    mockLoginWithPortal.mockRejectedValue({
      status: 401,
      message: "Invalid email or password. Please try again.",
    });

    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/email address/i), "bad@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrong");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));
    await waitFor(() => screen.getByText(/invalid email or password/i));

    // Now type in the email field — error should clear
    await user.type(screen.getByLabelText(/email address/i), "x");
    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });

  it("does not close the dialog on API error", async () => {
    mockLoginWithPortal.mockRejectedValue({ status: 401, message: "Bad creds" });

    const onOpenChange = jest.fn();
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={onOpenChange} />);

    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "bad");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => screen.getByText(/bad creds/i));
    // onOpenChange should NOT have been called with false
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe("LoginDialog — already authenticated", () => {
  it("calls onOpenChange(false) immediately when opened while authenticated", () => {
    mockIsAuthenticated = true;
    const onOpenChange = jest.fn();

    render(<LoginDialog open={true} onOpenChange={onOpenChange} />);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
