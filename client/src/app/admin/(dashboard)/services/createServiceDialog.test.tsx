import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateServiceDialog from "./createServiceDialog";
import type { Service } from "./type";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("@/src/lib/axiosIntercepter", () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn() },
}));

// Radix Dialog needs pointer-events; use a simple pass-through stub
jest.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent:     ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader:      ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle:       ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock("@/src/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
    disabled,
  }: {
    value?: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <select
      data-testid="category-select"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue:   ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const EXISTING_SERVICE: Service = {
  id: "svc-1",
  name: "Deep Cleaning",
  category: "Cleaning",
  description: "A thorough clean of your home.",
  price: 350,
  duration: 120,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function openCreate(props: Partial<React.ComponentProps<typeof CreateServiceDialog>> = {}) {
  render(
    <CreateServiceDialog
      open
      onOpenChange={jest.fn()}
      {...props}
    />
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CreateServiceDialog — create mode", () => {
  it("renders 'Create New Service' heading", () => {
    openCreate();
    expect(screen.getByRole("heading", { name: /create new service/i })).toBeInTheDocument();
  });

  it("renders the 'Create Service' submit button", () => {
    openCreate();
    expect(screen.getByRole("button", { name: /create service/i })).toBeInTheDocument();
  });

  it("renders required inputs: name, description, price, duration", () => {
    openCreate();
    expect(screen.getByRole("textbox", { name: /service name/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /price/i })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /duration/i })).toBeInTheDocument();
  });

  it("does not render the status toggle in create mode", () => {
    openCreate();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("shows validation error when name is too short on submit", async () => {
    openCreate();
    fireEvent.change(screen.getByRole("textbox", { name: /service name/i }), {
      target: { value: "A" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create service/i }));
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.some((a) => /at least 2 characters/i.test(a.textContent ?? ""))).toBe(true);
    });
  });

  it("calls the POST API with correct payload on valid submit", async () => {
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.post.mockResolvedValue({
      success: true,
      message: "Created",
      data: { ...EXISTING_SERVICE, id: "svc-new" },
    });
    const onCreated = jest.fn();
    openCreate({ onCreated });

    fireEvent.change(screen.getByRole("textbox", { name: /service name/i }), {
      target: { value: "New Service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "A valid description here" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
      target: { value: "500", valueAsNumber: 500 },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /duration/i }), {
      target: { value: "60", valueAsNumber: 60 },
    });
    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "Cleaning" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        "/admin/services",
        expect.objectContaining({ name: "New Service", category: "Cleaning" })
      )
    );
  });

  it("shows API error message when POST fails", async () => {
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.post.mockRejectedValue(new Error("Server error"));
    openCreate();

    fireEvent.change(screen.getByRole("textbox", { name: /service name/i }), {
      target: { value: "Good Service" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "A valid description here" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /price/i }), {
      target: { value: "100", valueAsNumber: 100 },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /duration/i }), {
      target: { value: "30", valueAsNumber: 30 },
    });
    fireEvent.change(screen.getByTestId("category-select"), {
      target: { value: "Plumbing" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create service/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/server error/i)
    );
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    const onOpenChange = jest.fn();
    openCreate({ onOpenChange });
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render when open=false", () => {
    render(
      <CreateServiceDialog open={false} onOpenChange={jest.fn()} />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("CreateServiceDialog — edit mode", () => {
  beforeEach(() =>
    openCreate({ service: EXISTING_SERVICE })
  );

  it("renders 'Edit Service' heading", () => {
    expect(
      screen.getByRole("heading", { name: /edit service/i })
    ).toBeInTheDocument();
  });

  it("pre-fills the name field with the existing service name", () => {
    expect(
      screen.getByRole("textbox", { name: /service name/i })
    ).toHaveValue("Deep Cleaning");
  });

  it("pre-fills the price field", () => {
    expect(
      screen.getByRole("spinbutton", { name: /price/i })
    ).toHaveValue(350);
  });

  it("pre-fills the duration field", () => {
    expect(
      screen.getByRole("spinbutton", { name: /duration/i })
    ).toHaveValue(120);
  });

  it("renders the status toggle switch in edit mode", () => {
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("toggle switch starts as checked for an active service", () => {
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("renders the 'Save Changes' submit button", () => {
    expect(
      screen.getByRole("button", { name: /save changes/i })
    ).toBeInTheDocument();
  });

  it("calls the PUT API when saving edits", async () => {
    const api = jest.requireMock("@/src/lib/axiosIntercepter").default;
    api.put.mockResolvedValue({
      success: true,
      message: "Updated",
      data: EXISTING_SERVICE,
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        `/admin/services/${EXISTING_SERVICE.id}`,
        expect.objectContaining({ name: "Deep Cleaning" })
      )
    );
  });
});
