import { render, screen } from "@testing-library/react";
import AdminHeader from "./adminHeader";

describe("AdminHeader", () => {
  beforeEach(() => render(<AdminHeader />));

  it("renders a banner landmark", () => {
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the search input with the correct aria-label", () => {
    expect(
      screen.getByRole("searchbox", { name: /search admin/i })
    ).toBeInTheDocument();
  });

  it("renders the notifications button", () => {
    expect(
      screen.getByRole("button", { name: /notifications/i })
    ).toBeInTheDocument();
  });

  it("renders the admin user avatar with its aria-label", () => {
    expect(
      screen.getByRole("generic", { name: /admin user/i })
    ).toBeInTheDocument();
  });

  it("displays 'AD' inside the avatar", () => {
    expect(screen.getByText("AD")).toBeInTheDocument();
  });
});
