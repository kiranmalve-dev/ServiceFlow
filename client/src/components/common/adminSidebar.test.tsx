import { render, screen } from "@testing-library/react";
import AdminSidebar from "./adminSidebar";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/admin/dashboard"),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("@/src/lib/auth", () => ({
  logout: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("cn", () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" "),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AdminSidebar — structure", () => {
  beforeEach(() => render(<AdminSidebar />));

  it("renders an aside with the admin navigation label", () => {
    expect(
      screen.getByRole("complementary", { name: /admin navigation/i })
    ).toBeInTheDocument();
  });

  it("renders the 'ServiceFlow Admin' brand text", () => {
    expect(screen.getByText("ServiceFlow Admin")).toBeInTheDocument();
  });

  it("renders the Sign out button", () => {
    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  });
});

describe("AdminSidebar — navigation links", () => {
  beforeEach(() => render(<AdminSidebar />));

  const links = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Services",  href: "/admin/services"  },
    { label: "Bookings",  href: "/admin/bookings"  },
    { label: "Users",     href: "/admin/users"     },
  ];

  it.each(links)("renders the $label link pointing to $href", ({ label, href }) => {
    const link = screen.getByRole("link", { name: new RegExp(label, "i") });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", href);
  });
});

describe("AdminSidebar — active link", () => {
  it("marks the active link with aria-current='page'", () => {
    const { usePathname } = jest.requireMock("next/navigation");
    usePathname.mockReturnValue("/admin/dashboard");
    render(<AdminSidebar />);
    expect(
      screen.getByRole("link", { name: /dashboard/i })
    ).toHaveAttribute("aria-current", "page");
  });

  it("does not mark inactive links with aria-current", () => {
    const { usePathname } = jest.requireMock("next/navigation");
    usePathname.mockReturnValue("/admin/dashboard");
    render(<AdminSidebar />);
    expect(
      screen.getByRole("link", { name: /services/i })
    ).not.toHaveAttribute("aria-current");
  });
});
