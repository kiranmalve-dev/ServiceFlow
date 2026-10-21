
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./header";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("../../store/localeStore", () => ({
  useLocaleStore: () => ({
    msgs: {},
    dir: "ltr",
    toggleLocale: jest.fn(),
    locale: "en",
  }),
}));

jest.mock("../../store/customerAuthStore", () => ({
  useCustomerAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    clearAuth: jest.fn(),
  }),
}));

jest.mock("../../i18", () => ({
  t: (_msgs: unknown, key: string) => key,
}));

jest.mock("../../lib/auth", () => ({
  logout: jest.fn(),
}));

jest.mock("../features/loginDialog", () => ({
  __esModule: true,
  default: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="Login dialog">
        <button onClick={() => onOpenChange(false)}>
          Close login
        </button>
      </div>
    ) : null,
}));

describe("Header component", () => {
  it("renders the header and home link", () => {
    render(<Header />);

    expect(
      screen.getByRole("banner")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "ServiceFlow — home",
      })
    ).toHaveAttribute("href", "/");
  });

  it("opens and closes the mobile menu", () => {
    render(<Header />);

    const openButton = screen.getByRole("button", {
      name: "Open menu",
    });

    fireEvent.click(openButton);

    expect(
      screen.getByRole("button", {
        name: "Close menu",
      })
    ).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("navigation", {
        name: "Main navigation",
      }).querySelector("#mobile-menu")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Close menu",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Open menu",
      })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the login dialog when sign-in is clicked", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "login.signIn",
      })
    );

    expect(
      screen.getByRole("dialog", {
        name: "Login dialog",
      })
    ).toBeInTheDocument();
  });
});
