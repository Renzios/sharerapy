import React from "react";
import { render, screen, within } from "@testing-library/react";
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

describe("Rendering", () => {
  it("displays name, contact number, country, and sex", () => {
    render(<PatientCard patient={makePatient()} />);

    expect(screen.getByRole("heading", { level: 1, name: "John Doe" })).toBeInTheDocument();

    // Contact number with '+' prefix (falls back to +N/A if empty)
    expect(screen.getByText("+123-456")).toBeInTheDocument();

    // Country section
    expect(screen.getByRole("heading", { level: 2, name: "Country" })).toBeInTheDocument();
    expect(screen.getByText("Philippines")).toBeInTheDocument();

    // Sex section
    expect(screen.getByRole("heading", { level: 2, name: "Sex" })).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
  });

  it('shows "+N/A" when contact number is empty', () => {
    render(<PatientCard patient={makePatient({ contact_number: "" })} />);
    expect(screen.getByText("+N/A")).toBeInTheDocument();
  });

  it('shows "N/A" when country is missing', () => {
    // Force a null country via double-cast to avoid any
    const patient = makePatient({
      country: null as unknown as { id: number; country: string },
    });
    render(<PatientCard patient={patient} />);

    // Scope the assertion to the Country section to avoid matching the Tag "N/A"
    const countryHeading = screen.getByRole("heading", { level: 2, name: "Country" });
    const countrySection = countryHeading.parentElement as HTMLElement;
    expect(within(countrySection).getByText("N/A")).toBeInTheDocument();
  });
  
  it("supports non-latin characters in name and country", () => {
    render(
      <PatientCard
        patient={makePatient({
          name: "张伟",
          country: { id: 3, country: "中国" },
        })}
      />
    );  
    expect(screen.getByRole("heading", { level: 1, name: "张伟" })).toBeInTheDocument();
    expect(screen.getByText("中国")).toBeInTheDocument();

    render(
      <PatientCard
        patient={makePatient({
          name: "Мария Иванова",
          country: { id: 4, country: "Россия" },
        })} 
      />
    );
    expect(screen.getByRole("heading", { level: 1, name: "Мария Иванова" })).toBeInTheDocument();
    expect(screen.getByText("Россия")).toBeInTheDocument();
  });
});

describe("User Interaction", () => {
  it("navigates to patient profile on click", async () => {
    render(<PatientCard patient={makePatient()} />);
    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: /john doe/i });

    expect(link.getAttribute("href")).toBe("/profile/patient/1");
    await user.click(link);
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

  it("is a link that points to the patient's profile URL", () => {
    const patient = makePatient({ id: "abc123" });
    render(<PatientCard patient={patient} />);

    const link = screen.getByRole("link", { name: /john doe/i });
    
    expect(link.getAttribute("href")).toBe("/profile/patient/abc123");
  });

});