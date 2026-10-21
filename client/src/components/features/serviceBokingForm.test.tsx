import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BookingForm from "./serviceBokingForm";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("@/src/lib/axiosIntercepter", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Stub Calendar to a simple date-input so we can set dates without dealing
// with the full radix/calendar internals in a unit test.
jest.mock("@/src/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect: (date: Date | undefined) => void }) => (
    <button
      type="button"
      data-testid="calendar-pick"
      onClick={() => onSelect(new Date("2027-03-15"))}
    >
      Pick March 15 2027
    </button>
  ),
}));

// ── Fixture ───────────────────────────────────────────────────────────────────

const SERVICE = {
  id: "svc-1",
  title: "Deep Cleaning",
  price: 350,
  duration: "120 min",
};

function openCalendarAndPickDate() {
  fireEvent.click(screen.getByRole("button", { name: /pick a date/i }));
  fireEvent.click(screen.getByTestId("calendar-pick"));
}

function pickTime(slot = "10:00") {
  fireEvent.click(
    screen.getByRole("button", {
      name: new RegExp(`^${slot}$`),
    }),
  );
}

function fillAddress(value = "123 Main St, Tel Aviv") {
  fireEvent.change(screen.getByRole("textbox", { name: /service address/i }), {
    target: { value },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("BookingForm — initial render", () => {
  beforeEach(() => render(<BookingForm service={SERVICE} />));

  it("renders the form heading label", () => {
    expect(screen.getByText(/schedule.*booking form/i)).toBeInTheDocument();
  });

  it("renders the date picker button in its default state", () => {
    expect(
      screen.getByRole("button", { name: /pick a date/i }),
    ).toBeInTheDocument();
  });

  it("renders all 8 time-slot buttons", () => {
    const slots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];

    slots.forEach((slot) => {
      expect(
        screen.getByRole("button", {
          name: new RegExp(`^${slot}$`),
        }),
      ).toBeInTheDocument();
    });
  });

  it("renders the address input", () => {
    expect(
      screen.getByRole("textbox", { name: /service address/i }),
    ).toBeInTheDocument();
  });

  it("renders the notes textarea", () => {
    expect(
      screen.getByRole("textbox", { name: /additional notes/i }),
    ).toBeInTheDocument();
  });

  it("renders the submit button as disabled", () => {
    expect(
      screen.getByRole("button", { name: /confirm.*book/i }),
    ).toBeDisabled();
  });

  it("shows guidance to pick a date", () => {
    expect(screen.getByText(/pick a date to continue/i)).toBeInTheDocument();
  });
});

describe("BookingForm — validation progression", () => {
  beforeEach(() => render(<BookingForm service={SERVICE} />));

  it("prompts for time after a date is selected", () => {
    openCalendarAndPickDate();
    expect(screen.getByText(/pick a time slot/i)).toBeInTheDocument();
  });

  it("prompts for address after date + time are selected", () => {
    openCalendarAndPickDate();
    pickTime();
    expect(screen.getByText(/enter a service address/i)).toBeInTheDocument();
  });

  it("shows 'Ready to submit' and enables the button when all fields are filled", () => {
    openCalendarAndPickDate();
    pickTime();
    fillAddress();
    expect(screen.getByText(/ready to submit/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm.*book/i }),
    ).not.toBeDisabled();
  });
});

describe("BookingForm — time slot selection", () => {
  beforeEach(() => render(<BookingForm service={SERVICE} />));

  it("marks a time slot as selected (aria-pressed=true) when clicked", () => {
    pickTime("11:00");
    expect(screen.getByRole("button", { name: /^11:00$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("deselects the previous slot when a new one is clicked", () => {
    pickTime("09:00");
    pickTime("14:00");
    expect(
      screen.getByRole("button", { name: /^09:00$/  }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button",{ name: /^14:00$/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("BookingForm — address validation", () => {
  beforeEach(() => render(<BookingForm service={SERVICE} />));

  it("shows an error when address is shorter than 5 characters", () => {
    fillAddress("abc");
    expect(screen.getByRole("alert")).toHaveTextContent(
      /at least 5 characters/i,
    );
  });

  it("hides the error once address reaches 5+ characters", () => {
    fillAddress("abc");
    fillAddress("123 Valid Street");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("BookingForm — calendar toggle", () => {
  beforeEach(() => render(<BookingForm service={SERVICE} />));

  it("opens the calendar dialog when the date button is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /pick a date/i }));
    expect(
      screen.getByRole("dialog", { name: /date picker calendar/i }),
    ).toBeInTheDocument();
  });

  it("closes the calendar after a date is picked", () => {
    openCalendarAndPickDate();
    expect(
      screen.queryByRole("dialog", { name: /date picker calendar/i }),
    ).not.toBeInTheDocument();
  });

  it("updates the button label to the selected date", () => {
    openCalendarAndPickDate();
    // date-fns format("PPP") → "March 15th, 2027"
    expect(
      screen.getByRole("button", { name: /march 15/i }),
    ).toBeInTheDocument();
  });
});

describe("BookingForm — form submission", () => {
  // Access the mock via requireMock — no top-level import of the real module needed
  const apiMock = () =>
    jest.requireMock("@/src/lib/axiosIntercepter").default as {
      post: jest.Mock;
    };

  beforeEach(() => render(<BookingForm service={SERVICE} />));

  function fillAll() {
    openCalendarAndPickDate();
    pickTime("10:00");
    fillAddress("123 Main St, Tel Aviv");
  }

  it("calls the bookings API with correct payload on submit", async () => {
    apiMock().post.mockResolvedValue({ success: true });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() =>
      expect(apiMock().post).toHaveBeenCalledWith(
        "/bookings",
        expect.objectContaining({
          serviceId: SERVICE.id,
          address: "123 Main St, Tel Aviv",
        }),
      ),
    );
  });

  it("shows the success confirmation after booking is created", async () => {
    apiMock().post.mockResolvedValue({ success: true });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() =>
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument(),
    );
  });

  it("shows a 'Browse More Services' link on success pointing to /", async () => {
    apiMock().post.mockResolvedValue({ success: true });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /browse more services/i });
      expect(link).toHaveAttribute("href", "/");
    });
  });

  it("shows an API error message when the request fails", async () => {
    apiMock().post.mockRejectedValue({ message: "Service unavailable" });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /service unavailable/i,
      ),
    );
  });

  it("shows the button in loading state while submitting", async () => {
    apiMock().post.mockReturnValue(new Promise(() => {}));
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /creating booking/i }),
      ).toBeInTheDocument(),
    );
  });

  it("disables the submit button while submitting", async () => {
    apiMock().post.mockReturnValue(new Promise(() => {}));
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: /confirm.*book/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /creating booking/i }),
      ).toBeDisabled(),
    );
  });
});
