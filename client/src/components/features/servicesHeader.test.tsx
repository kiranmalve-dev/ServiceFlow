import { render, screen } from "@testing-library/react";
import { useLocaleStore } from "../../store/localeStore";
import { t } from "../../i18";
import ServicesHeader from "./servicesHeader";

jest.mock("../../store/localeStore", () => ({
  useLocaleStore: jest.fn(),
}));

jest.mock("../../i18", () => ({
  t: jest.fn(),
}));

describe("ServicesHeader", () => {
  it("renders the services title and subtitle", () => {
    jest.mocked(useLocaleStore).mockReturnValue({
      msgs: {},
    } as ReturnType<typeof useLocaleStore>);
    (t as jest.Mock).mockImplementation((_msgs: unknown, key: string) => {
      const translations: Record<string, string> = {
        "services.title": "Our Services",
        "services.subtitle": "Explore our services",
      };

      return translations[key] ?? key;
    });

    render(<ServicesHeader />);

    expect(
      screen.getByRole("heading", { name: "Our Services" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Explore our services")).toBeInTheDocument();
  });
});
