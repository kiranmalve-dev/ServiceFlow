import { render, screen } from "@testing-library/react";
import ServiceDetailContent from "./serviceDetailContent";
import { useLocaleStore } from "../../store/localeStore";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("../../store/localeStore", () => ({
  useLocaleStore: jest.fn(),
}));

jest.mock("../../i18", () => ({
  t: (_msgs: unknown, key: string) => key,
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

// BookingForm is heavy — stub it so we only test ServiceDetailContent in isolation
jest.mock("./serviceBokingForm", () => ({
  __esModule: true,
  default: ({ service }: { service: { title: string } }) => (
    <div data-testid="booking-form">BookingForm for {service.title}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_SERVICE = {
  id:          "svc-1",
  name:        "Deep Cleaning",
  category:    "Cleaning",
  description: "A thorough clean of your home.",
  price:       350,
  duration:    120,
  isActive:    true,
};

function setup(overrides: Partial<typeof BASE_SERVICE> = {}) {
  jest.mocked(useLocaleStore).mockReturnValue({
    msgs: {},
  } as ReturnType<typeof useLocaleStore>);

  render(
    <ServiceDetailContent
      service={{ ...BASE_SERVICE, ...overrides }}
      pillClass="bg-teal-100 text-teal-700"
      barClass="bg-teal-400"
    />
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ServiceDetailContent — active service", () => {
  beforeEach(() => setup());

  it("renders the service name as an h1", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: /deep cleaning/i })
    ).toBeInTheDocument();
  });

  it("displays the category label", () => {
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
  });

  it("displays the service description", () => {
    expect(
      screen.getByText(/a thorough clean of your home/i)
    ).toBeInTheDocument();
  });

  it("shows the price using the ₪ symbol", () => {
    expect(screen.getByText("₪350")).toBeInTheDocument();
  });

  it("shows the duration value", () => {
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("shows the 'currently available' status text", () => {
    expect(
      screen.getByText("serviceDetail.currentlyAvailable")
    ).toBeInTheDocument();
  });

  it("renders the BookingForm for an active service", () => {
    expect(screen.getByTestId("booking-form")).toBeInTheDocument();
    expect(screen.getByTestId("booking-form")).toHaveTextContent(
      "BookingForm for Deep Cleaning"
    );
  });

  it("does NOT show the unavailable panel", () => {
    expect(
      screen.queryByText("serviceDetail.notAvailableTitle")
    ).not.toBeInTheDocument();
  });
});

describe("ServiceDetailContent — inactive service", () => {
  beforeEach(() => setup({ isActive: false }));

  it("shows the 'not available' status text", () => {
    expect(
      screen.getByText("serviceDetail.notAvailable")
    ).toBeInTheDocument();
  });

  it("renders the unavailable panel heading", () => {
    expect(
      screen.getByRole("heading", { name: "serviceDetail.notAvailableTitle" })
    ).toBeInTheDocument();
  });

  it("renders the unavailable message", () => {
    expect(
      screen.getByText("serviceDetail.notAvailableMessage")
    ).toBeInTheDocument();
  });

  it("renders a 'Browse other services' link pointing to /", () => {
    const link = screen.getByRole("link", {
      name: "serviceDetail.browseOtherServices",
    });
    expect(link).toHaveAttribute("href", "/");
  });

  it("does NOT render the BookingForm", () => {
    expect(screen.queryByTestId("booking-form")).not.toBeInTheDocument();
  });
});

describe("ServiceDetailContent — i18n labels", () => {
  it("renders the section label keys via t()", () => {
    setup();
    // These keys get returned as-is by our t() stub
    expect(screen.getByText("serviceDetail.serviceDetails")).toBeInTheDocument();
    expect(screen.getByText("serviceDetail.aboutService")).toBeInTheDocument();
    expect(screen.getByText("serviceDetail.price")).toBeInTheDocument();
    expect(screen.getByText("serviceDetail.duration")).toBeInTheDocument();
  });
});
