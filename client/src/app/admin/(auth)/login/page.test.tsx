import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLoginPage from "./page";

// ── Stubs ─────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/src/store/authStore", () => ({
  useAuthStore: (selector: (s: { setAuth: jest.Mock }) => unknown) =>
    selector({ setAuth: jest.fn() }),
}));

jest.mock("@/src/store/localeStore", () => ({
  useLocaleStore: () => ({ msgs: {} }),
}));

jest.mock("@/src/i18", () => ({
  t: (_msgs: unknown, key: string) => key,
}));

jest.mock("@/src/lib/auth", () => ({
  loginWithPortal: jest.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function fillAndSubmit(email = "admin@example.com", password = "secret123") {
  fireEvent.change(screen.getByLabelText(/login\.emailAddress/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/login\.password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /login\.signIn/i }));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AdminLoginPage — initial render", () => {
  beforeEach(() => render(<AdminLoginPage />));

  it("renders the admin portal heading", () => {
    expect(screen.getByRole("heading", { name: /admin\.portal/i })).toBeInTheDocument();
  });

  it("renders the email input", () => {
    expect(screen.getByRole("textbox", { name: /login\.emailAddress/i })).toBeInTheDocument();
  });

  it("renders the password input", () => {
    expect(screen.getByLabelText(/login\.password/i)).toBeInTheDocument();
  });

  it("renders the Sign In submit button", () => {
    expect(
      screen.getByRole("button", { name: /login\.signIn/i })
    ).toBeInTheDocument();
  });

  it("renders the show-password toggle button", () => {
    expect(
      screen.getByRole("button", { name: /login\.showPassword/i })
    ).toBeInTheDocument();
  });
});

describe("AdminLoginPage — password visibility toggle", () => {
  beforeEach(() => render(<AdminLoginPage />));

  it("password field starts as type=password", () => {
    expect(screen.getByLabelText(/login\.password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("reveals password when toggle is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /login\.showPassword/i }));
    expect(screen.getByLabelText(/login\.password/i)).toHaveAttribute(
      "type",
      "text"
    );
  });

  it("hides password again when toggle is clicked twice", () => {
    const toggle = screen.getByRole("button", { name: /login\.showPassword/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: /login\.hidePassword/i }));
    expect(screen.getByLabelText(/login\.password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });
});

describe("AdminLoginPage — empty-field validation", () => {
  beforeEach(() => render(<AdminLoginPage />));

  it("shows an error alert when both fields are empty on submit", async () => {
    fireEvent.click(screen.getByRole("button", { name: /login\.signIn/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("errors.fillAllFields")
    );
  });

  it("does not call loginWithPortal when fields are empty", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    fireEvent.click(screen.getByRole("button", { name: /login\.signIn/i }));
    await waitFor(() => screen.getByRole("alert"));
    expect(loginWithPortal).not.toHaveBeenCalled();
  });
});

describe("AdminLoginPage — successful login", () => {
  it("calls loginWithPortal with admin portal credentials", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    loginWithPortal.mockResolvedValue({
      success: true,
      data: { id: 1, email: "admin@example.com", name: "Admin", role: "admin" },
    });
    render(<AdminLoginPage />);
    fillAndSubmit();
    await waitFor(() =>
      expect(loginWithPortal).toHaveBeenCalledWith({
        email:    "admin@example.com",
        password: "secret123",
        portal:   "admin",
      })
    );
  });

  it("redirects to /admin/dashboard after successful login", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    loginWithPortal.mockResolvedValue({
      success: true,
      data: { id: 1, email: "admin@example.com", name: "Admin", role: "admin" },
    });
    render(<AdminLoginPage />);
    fillAndSubmit();
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard")
    );
  });
});

describe("AdminLoginPage — failed login", () => {
  it("shows the API error message when login fails", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    loginWithPortal.mockRejectedValue({ message: "Invalid credentials" });
    render(<AdminLoginPage />);
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/invalid credentials/i)
    );
  });

  it("falls back to the i18n key when error has no message", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    loginWithPortal.mockRejectedValue({});
    render(<AdminLoginPage />);
    fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "errors.invalidCredentials"
      )
    );
  });

  it("disables the submit button while loading", async () => {
    const { loginWithPortal } = jest.requireMock("@/src/lib/auth");
    loginWithPortal.mockReturnValue(new Promise(() => {}));
    render(<AdminLoginPage />);
    fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /login\.signingIn/i })
      ).toBeDisabled()
    );
  });
});
