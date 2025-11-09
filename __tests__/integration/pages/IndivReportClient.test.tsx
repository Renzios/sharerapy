import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Provide a push mock and mock next/navigation so Link clicks can call router.push
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock next/link to call useRouter().push when clicked (prevents real navigation)
jest.mock("next/link", () => {
  const React = require("react");
  const { useRouter } = require("next/navigation");
  const Component = ({ href, children, ...props }: any) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        try {
          const r = useRouter();
          if (r && typeof r.push === "function") r.push(href);
        } catch (err) {
          // ignore
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
  Component.displayName = "NextLinkMock";
  return Component;
});

import IndivReportClient from "@/components/client-pages/IndivReportClient";

// Mock the back navigation hook so we can assert it was called
const handleBackClickMock = jest.fn();
jest.mock("@/app/hooks/useBackNavigation", () => ({
  useBackNavigation: () => ({ handleBackClick: handleBackClickMock }),
}));

// Mock PDFViewer to avoid heavy rendering
jest.mock("@/components/blocknote/PDFViewer", () => {
  const Component = (_props: { content: string; title: string; therapistName: string }) => (
    <div data-testid="pdf-viewer">PDF Viewer</div>
  );
  Component.displayName = "PDFViewer";
  return Component;
});

// Mock Select to a simple native select for deterministic onChange behavior
jest.mock("@/components/general/Select", () => {
  const Component = (props: {
    label?: string;
    options?: Array<{ value: string; label: string }>;
    value?: { value: string; label: string } | null;
    onChange?: (v: { value: string; label: string } | null) => void;
    placeholder?: string;
    instanceId?: string;
  }) => (
    <select
      data-testid="display-language-select"
      value={props.value?.value ?? ""}
      onChange={(e) => props.onChange?.({ value: e.target.value, label: e.target.selectedOptions?.[0]?.text || e.target.value })}
    >
      <option value="">-</option>
      {(props.options || []).map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  Component.displayName = "Select";
  return Component;
});

describe("IndivReportClient integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  interface ReportFixture {
    id: string;
    title: string;
    created_at: string;
    therapist: { id: string; name: string; clinic: { clinic: string; country: { country: string } } };
    type: { type: string };
    language: { language: string };
    patient: { id: string; name: string; sex: string; age?: string };
    description: string;
    content: string;
  }

  const sampleReport: ReportFixture = {
    id: "rep-1",
    title: "Sample Report",
    created_at: "2023-04-01T00:00:00.000Z",
    therapist: { id: "ther-1", name: "Dr. Alice", clinic: { clinic: "Care Clinic", country: { country: "CountryX" } } },
    type: { type: "Assessment" },
    language: { language: "English" },
    patient: { id: "pat-1", name: "Jane Doe", sex: "Female", age: "30" },
    description: "A short description",
    content: "[]",
  };

  type IndivProps = Parameters<typeof IndivReportClient>[0];
  const typedReport = sampleReport as IndivProps["report"];

  it("renders report metadata, therapist and patient info and PDF viewer", () => {
    render(<IndivReportClient report={typedReport} />);

  // Title and description (select heading specifically to avoid matching PDF mock)
  expect(screen.getByRole("heading", { name: /Sample Report/ })).toBeInTheDocument();
    expect(screen.getByText("A short description")).toBeInTheDocument();

    // Therapist and patient blocks
    expect(screen.getByText("Dr. Alice")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    // PDFViewer mocked output
    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
  });

  it("calls back navigation when Back is clicked and disables the button", async () => {
    render(<IndivReportClient report={typedReport} />);

    const backBtn = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backBtn);

    await waitFor(() => expect(handleBackClickMock).toHaveBeenCalled());
    await waitFor(() => expect(backBtn).toBeDisabled());
  });

  it("changes display language via the Select mock", async () => {
    render(<IndivReportClient report={typedReport} />);

    const sel = screen.getByTestId("display-language-select") as HTMLSelectElement;
    fireEvent.change(sel, { target: { value: "filipino" } });

    await waitFor(() => expect(sel.value).toBe("filipino"));
  });

  it("navigates to therapist profile on click (router.push)", async () => {
    render(<IndivReportClient report={typedReport} />);

    const therapistLink = screen.getByText("Dr. Alice").closest("a");
    fireEvent.click(therapistLink!);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/profile/therapist/ther-1"));
  });

  it("navigates to patient profile on click (router.push)", async () => {
    render(<IndivReportClient report={typedReport} />);

    const patientLink = screen.getByText("Jane Doe").closest("a");
    fireEvent.click(patientLink!);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/profile/patient/pat-1"));
  });
});
