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

// Mock Tag component to verify therapy type classification
jest.mock("@/components/general/Tag", () => {
  return function MockTag(props: { 
    text: string; 
    fontSize?: string; 
    therapyType?: "speech" | "occupational" | "sped" | "developmental" | "reading";
  }) {
    return (
      <span 
        data-testid="tag" 
        data-font-size={props.fontSize}
        data-therapy-type={props.therapyType}
      >
        {props.text}
      </span>
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
  reports: [],
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

  it('renders "N/A" tag when reports array is empty', () => {
    render(<PatientCard patient={makePatient({ reports: [] })} />);
    
    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(1);
    expect(tags[0]).toHaveTextContent("N/A");
  });

  it("renders single report type as tag", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Speech Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(1);
    expect(tags[0]).toHaveTextContent("Speech Therapy");
  });

  it("renders multiple report types as separate tags", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "Speech Therapy" } },
        { type: { type: "Occupational Therapy" } },
        { type: { type: "Developmental Therapy" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(3);
    expect(tags[0]).toHaveTextContent("Speech Therapy");
    expect(tags[1]).toHaveTextContent("Occupational Therapy");
    expect(tags[2]).toHaveTextContent("Developmental Therapy");
  });

  it("correctly identifies speech therapy type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Speech Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "speech");
  });

  it("correctly identifies occupational therapy type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Occupational Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "occupational");
  });

  it("correctly identifies sped therapy type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "SPED" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "sped");
  });

  it("correctly identifies developmental therapy type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Developmental Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "developmental");
  });

  it("correctly identifies reading therapy type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Reading Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "reading");
  });

  it("handles 'special ed' variant for sped type", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Special Education" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-therapy-type", "sped");
  });

  it("is case-insensitive when matching therapy types", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "SPEECH THERAPY" } },
        { type: { type: "occupational therapy" } },
        { type: { type: "SpEd" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags[0]).toHaveAttribute("data-therapy-type", "speech");
    expect(tags[1]).toHaveAttribute("data-therapy-type", "occupational");
    expect(tags[2]).toHaveAttribute("data-therapy-type", "sped");
  });

  it("handles therapy types with extra whitespace", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "  Speech Therapy  " } },
        { type: { type: "\tOccupational\t" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags[0]).toHaveAttribute("data-therapy-type", "speech");
    expect(tags[1]).toHaveAttribute("data-therapy-type", "occupational");
  });

  it("returns undefined for unrecognized therapy types", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Physical Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    // When therapyType is undefined, the attribute won't be set or will be null
    const therapyType = tag.getAttribute("data-therapy-type");
    expect(therapyType === null || therapyType === "undefined").toBe(true);
  });

  it("handles reports with null type object", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "Speech Therapy" } },
        { type: null },
        { type: { type: "Occupational Therapy" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveTextContent("Speech Therapy");
    expect(tags[1]).toHaveTextContent("Occupational Therapy");
  });

  it("handles reports with null type string", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "Speech Therapy" } },
        { type: { type: null } },
        { type: { type: "Reading Therapy" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveTextContent("Speech Therapy");
    expect(tags[1]).toHaveTextContent("Reading Therapy");
  });

  it("applies correct font size to therapy tags", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Speech Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveAttribute("data-font-size", "text-xs");
  });

  it("handles therapy type containing multiple keywords", () => {
    const patient = makePatient({
      reports: [{ type: { type: "Speech and Language Therapy" } }],
    });
    render(<PatientCard patient={patient} />);

    const tag = screen.getByTestId("tag");
    // Should match "speech" first since it appears first in the type string
    expect(tag).toHaveAttribute("data-therapy-type", "speech");
  });

  it("handles partial matches in therapy type names", () => {
    const patient = makePatient({
      reports: [
        { type: { type: "Speech pathology" } },
        { type: { type: "Occupational health" } },
      ],
    });
    render(<PatientCard patient={patient} />);

    const tags = screen.getAllByTestId("tag");
    expect(tags[0]).toHaveAttribute("data-therapy-type", "speech");
    expect(tags[1]).toHaveAttribute("data-therapy-type", "occupational");
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

  it("supports hover without changing content", async () => {
    render(<PatientCard patient={makePatient()} />);
    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: /john doe/i });

    await user.hover(link);
    expect(screen.getByRole("heading", { level: 1, name: "John Doe" })).toBeInTheDocument();
    expect(screen.getByText("Philippines")).toBeInTheDocument();
  });

  it("is keyboard accessible via Enter key", async () => {
    render(<PatientCard patient={makePatient()} />);
    const user = userEvent.setup();
    const link = screen.getByRole("link", { name: /john doe/i });

    await user.tab();
    expect(link).toHaveFocus();

    await user.keyboard("{Enter}");
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