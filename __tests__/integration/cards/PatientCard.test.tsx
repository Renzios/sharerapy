import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientCard from "@/components/cards/PatientCard";

// Mock next/link to render a plain anchor so we can assert href and click behavior
jest.mock("next/link", () => {
  return function Link({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock patient data
const makePatient = (overrides?: Partial<Parameters<typeof PatientCard>[0]["patient"]>) => ({
  id: "1",
  name: "John Doe",
  contact_number: "123-456",
  country: { id: 1, country: "Philippines" },
  sex: "Male",
  ...overrides,
});

describe("PatientCard - Rendering", () => {
  it("displays name, contact number, country, and sex", () => {
    render(<PatientCard patient={makePatient()} />);

    expect(screen.getByRole("heading", { level: 1, name: "John Doe" })).toBeInTheDocument();

    // Contact number (falls back to N/A if empty)
    expect(screen.getByText("123-456")).toBeInTheDocument();

    // Country section
    expect(screen.getByRole("heading", { level: 2, name: "Country" })).toBeInTheDocument();
    expect(screen.getByText("Philippines")).toBeInTheDocument();

    // Sex section
    expect(screen.getByRole("heading", { level: 2, name: "Sex" })).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
  });

  it('shows "N/A" when contact number is empty', () => {
    render(<PatientCard patient={makePatient({ contact_number: "" })} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it('shows "N/A" when country is missing', () => {
    // Force a null country via double-cast to avoid any
    const patient = makePatient({
      country: null as unknown as { id: number; country: string },
    });
    render(<PatientCard patient={patient} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});

describe("User Interaction", () => {
  it("is a link that points to the patient's profile URL", () => {
    const patient = makePatient({ id: "abc123" });
    render(<PatientCard patient={patient} />);

    const link = screen.getByRole("link", { name: /john doe/i });
    
    expect(link.getAttribute("href")).toBe("/profile/patient/abc123");
  });

  it("is focusable and clickable", async () => {
    render(<PatientCard patient={makePatient()} />);
    const user = userEvent.setup();

    const link = screen.getByRole("link", { name: /john doe/i });

    await user.tab();
    expect(document.activeElement).toBe(link);

    // Clicking shouldn't throw; we just ensure it's clickable
    await user.click(link);
    expect(link).toBeInTheDocument();
  });
});

describe("Props Handling", () => {
  it("uses patient.id to construct href", () => {
    const patient = makePatient({ id: "2" });
    render(<PatientCard patient={patient} />);

    const link = screen.getByRole("link", { name: /john doe/i });
    expect(link.getAttribute("href")).toBe("/profile/patient/2");
  });

  it("updates displayed values when props change", async () => {
    const { rerender } = render(<PatientCard patient={makePatient()} />);

    expect(screen.getByRole("heading", { level: 1, name: "John Doe" })).toBeInTheDocument();
    expect(screen.getByText("123-456")).toBeInTheDocument();
    expect(screen.getByText("Philippines")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();

    // Change props and rerender
    rerender(
      <PatientCard
        patient={makePatient({
          id: "9",
          name: "Jane Smith",
          contact_number: "999-999",
          country: { id: 2, country: "South Korea" },
          sex: "Female",
        })}
      />
    );

    // New values are displayed
    expect(screen.getByRole("heading", { level: 1, name: "Jane Smith" })).toBeInTheDocument();
    expect(screen.getByText("999-999")).toBeInTheDocument();
    expect(screen.queryByText("123-456")).toBeNull();
    expect(screen.getByText("South Korea")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /jane smith/i });
    expect(link.getAttribute("href")).toBe("/profile/patient/9");
  });
});