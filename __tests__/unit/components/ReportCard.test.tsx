import { render, screen } from "@testing-library/react";
import ReportCard from "@/components/ReportCard";

describe("ReportCard Component", () => {
  const mockReport = {
    title: "Assessment Report A",
    description: "This is a short summary of the assessment results.",
    dateUploaded: "2025-09-30",
    country: "United States",
    language: "English",
    therapyType: "CBT",
    clinic: "Sunrise Clinic",
    therapistName: "Dr. Alice Walker",
    therapistPFP: "/testpfp.jpg",
  };

  const mockReportAlt = {
    title: "Follow-up Report B",
    description: "Follow-up session notes and recommendations.",
    dateUploaded: "2025-08-15",
    country: "Canada",
    language: "French",
    therapyType: "DBT",
    clinic: "Northside Therapy",
    therapistName: "Dr. Bob Martin",
    therapistPFP: null,
  };

  it("renders without crashing", () => {
    render(<ReportCard report={mockReport} />);

    const card = screen.getByText(mockReport.title).closest("div");
    expect(card).toBeInTheDocument();
  });

  it("displays report title correctly", () => {
    render(<ReportCard report={mockReport} />);

    const title = screen.getByRole("heading", { name: mockReport.title });
    expect(title).toBeInTheDocument();
  });

  it("displays report description", () => {
    render(<ReportCard report={mockReport} />);

    const description = screen.getByText(mockReport.description);
    expect(description).toBeInTheDocument();
  });

  it("displays metadata (date, country, language, therapy type, clinic)", () => {
    render(<ReportCard report={mockReport} />);

    // The component renders a single metadata line containing these values joined by " | "
    expect(
      screen.getByText((content) => {
        return (
          content.includes(mockReport.dateUploaded) &&
          content.includes(mockReport.country) &&
          content.includes(mockReport.language) &&
          content.includes(mockReport.therapyType) &&
          content.includes(mockReport.clinic)
        );
      })
    ).toBeInTheDocument();
  });

  it("displays therapist name and profile image alt", () => {
    render(<ReportCard report={mockReport} />);

    expect(
      screen.getByRole("heading", { name: mockReport.therapistName })
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Therapist Profile Picture")
    ).toBeInTheDocument();
  });

  it("renders different report data correctly", () => {
    render(<ReportCard report={mockReportAlt} />);

    expect(
      screen.getByRole("heading", { name: mockReportAlt.title })
    ).toBeInTheDocument();
    expect(screen.getByText(mockReportAlt.description)).toBeInTheDocument();

    // metadata is rendered as a single line (e.g. "2025-08-15 | Canada | French | DBT | Northside Therapy")
    expect(
      screen.getByText((content) => content.includes(mockReportAlt.country))
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: mockReportAlt.therapistName })
    ).toBeInTheDocument();
  });

  it("handles long report titles correctly", () => {
    const longTitleReport = {
      ...mockReport,
      title:
        "Comprehensive Multi-Session Assessment and Longitudinal Progress Report: Phase 1 — Initial Baseline",
    };

    render(<ReportCard report={longTitleReport} />);

    const title = screen.getByRole("heading", { name: longTitleReport.title });
    expect(title).toBeInTheDocument();
  });

  it("handles missing therapistPFP gracefully", () => {
    const noPfpReport = { ...mockReport, therapistPFP: undefined };
    render(<ReportCard report={noPfpReport} />);

    // Image should still render with alt text (fallback handled in component)
    expect(
      screen.getByAltText("Therapist Profile Picture")
    ).toBeInTheDocument();
  });

  it("displays all required information fields", () => {
    render(<ReportCard report={mockReport} />);

    expect(
      screen.getByRole("heading", { level: 1, name: mockReport.title })
    ).toBeInTheDocument();
    expect(screen.getByText(mockReport.description)).toBeInTheDocument();
    expect(screen.getByText(mockReport.therapistName)).toBeInTheDocument();
  });

  it("maintains semantic HTML structure for headings", () => {
    render(<ReportCard report={mockReport} />);

    // Title should be an h1
    const title = screen.getByRole("heading", {
      level: 1,
      name: mockReport.title,
    });
    expect(title).toBeInTheDocument();

    // Therapist name in the component uses an h2
    const therapistHeading = screen.getByRole("heading", {
      level: 2,
      name: mockReport.therapistName,
    });
    expect(therapistHeading).toBeInTheDocument();
  });
});
