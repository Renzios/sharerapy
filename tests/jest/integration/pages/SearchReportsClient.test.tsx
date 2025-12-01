import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Provide mocks for next/navigation so Link clicks can call router.push and
// components that use pathname/searchParams and replace work in tests
const pushMock = jest.fn();
const replaceMock = jest.fn();
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/search/reports",
  useSearchParams: () => ({
    get: () => null,
    toString: () => "",
  }),
}));

// Mock next/link to call the pushMock when clicked
interface NextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}
jest.mock("next/link", () => {
  const Component = (props: NextLinkProps) => {
    const { href, children, ...rest } = props;
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          if (typeof pushMock === "function") pushMock(href);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  };
  Component.displayName = "NextLinkMock";
  return {
    __esModule: true,
    default: Component,
  };
});

import SearchReportsClient from "@/components/client-pages/search/SearchReportsClient";

// Minimal test types
type ReportLike = { id: string; title: string };

// Mock ReportCard to a simple anchor that triggers pushMock
jest.mock("@/components/cards/ReportCard", () => {
  const Component = ({ report }: { report: ReportLike }) => (
    <a
      href={`/reports/${report.id}`}
      onClick={(e) => {
        e.preventDefault();
        if (typeof pushMock === "function") pushMock(`/reports/${report.id}`);
      }}
    >
      {report.title}
    </a>
  );
  Component.displayName = "ReportCard";
  return Component;
});

// Mock translateText action
const mockTranslateText = jest.fn();
jest.mock("@/lib/actions/translate", () => ({
  translateText: (text: string, targetLanguage: string) => 
    mockTranslateText(text, targetLanguage),
}));

describe("SearchReportsClient integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const initialReports = [
    {
      id: "rep-1",
      title: "Report One",
      description: "desc",
      content: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      language_id: 1,
      patient_id: "pat-1",
      therapist_id: "ther-1",
      type_id: 1,
      therapist: {
        id: "ther-1",
        name: "Dr. Alice",
        first_name: "A",
        last_name: "B",
        picture: "",
        bio: "",
        age: 40,
        clinic_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clinic: { clinic: "C", country_id: 1, id: 1, country: { country: "CountryX", id: 1 } },
      },
      type: { id: 1, type: "Assessment" },
      language: { id: 1, code: "en", language: "English" },
      patient: {
        id: "pat-1",
        name: "Jane Doe",
        first_name: "Jane",
        last_name: "Doe",
        contact_number: "",
        country_id: 1,
        country: { country: "CountryX", id: 1 },
        sex: "Female" as const,
        birthdate: "1993-01-01",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reports: [{ type: { id: 1, type: "Assessment" } }],
      },
    },
  ];

  it("renders initial reports and their links", () => {
  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} countryOptions={[]} clinicOptions={[]} typeOptions={[]} therapistOptions={[]} patientOptions={[]} />);

    expect(screen.getByText("Report One")).toBeInTheDocument();
  });

  it("navigates to a report on click (router.push called)", async () => {
  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} countryOptions={[]} clinicOptions={[]} typeOptions={[]} therapistOptions={[]} patientOptions={[]} />);

    const repLink = screen.getByText("Report One").closest("a");
    await userEvent.click(repLink!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/rep-1"));
  });

  it("performs search and updates URL with search params", async () => {
  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} countryOptions={[]} clinicOptions={[]} typeOptions={[]} therapistOptions={[]} patientOptions={[]} />);

  // Query by role to avoid relying on placeholder text (more robust)
  const input = screen.getByRole("textbox") as HTMLInputElement;
  await userEvent.clear(input);
  await userEvent.type(input, "Alice");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("q=Alice"),
        { scroll: false }
      );
    });
  });

  it("performs update when sorting parameter is changed", async () => {
    const { container } = render(
      <SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} countryOptions={[]} clinicOptions={[]} typeOptions={[]} therapistOptions={[]} patientOptions={[]} />
    );

    // Find the react-select control and open the menu (react-select renders into a portal)
    const selectContainer = container.querySelector('[class*="react-select"]');
    expect(selectContainer).toBeInTheDocument();

    await userEvent.click(selectContainer!);

    // react-select renders the menu with role listbox; wait for it and choose the option
    const menu = await screen.findByRole("listbox");
    expect(menu).toBeInTheDocument();

    // Select the "Title (A-Z)" option
    const titleAscOption = await screen.findByText("Sort by: Title (A-Z)");
    await userEvent.click(titleAscOption);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("sort=titleAscending"),
        { scroll: false }
      );
    });

    // Select the "Title (Z-A)" option
    await userEvent.click(selectContainer!);
    const titleDescOption = await screen.findByText("Sort by: Title (Z-A)");
    await userEvent.click(titleDescOption);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("sort=titleDescending"),
        { scroll: false }
      );
    });

    // Select the "Created At (Newest)" option
    await userEvent.click(selectContainer!);
    const dateAtNewOptions = await screen.findAllByText("Sort by: Date (Newest First)");
    // Click the option in the menu (not the selected value display)
    await userEvent.click(dateAtNewOptions[dateAtNewOptions.length - 1]);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("sort=dateDescending"),
        { scroll: false }
      );
    });

    // Select the "Created At (Oldest)" option
    await userEvent.click(selectContainer!);
    const dateOldOption = await screen.findByText("Sort by: Date (Oldest First)");
    await userEvent.click(dateOldOption);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("sort=dateAscending"),
        { scroll: false }
      );
    });
  });

  it("handles page change and updates URL", async () => {
    // Render with multiple pages available so Pagination shows
    render(<SearchReportsClient initialReports={initialReports} totalPages={3} languageOptions={[]} countryOptions={[]} clinicOptions={[]} typeOptions={[]} therapistOptions={[]} patientOptions={[]} />);

    // The pagination should render page buttons; click page 2
    const pageTwo = await screen.findByText("2");
    await userEvent.click(pageTwo);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("p=2"),
        { scroll: false }
      );
    });
  });

  it("shows success toast and cleans URL when showSuccessToast is true", async () => {
    render(
      <SearchReportsClient
        initialReports={initialReports}
        totalPages={1}
        showSuccessToast={true}
        languageOptions={[]}
        countryOptions={[]}
        clinicOptions={[]}
        typeOptions={[]}
        therapistOptions={[]}
        patientOptions={[]}
      />
    );

    // The toast message should be visible
    const toast = await screen.findByText("Report created successfully!");
    expect(toast).toBeInTheDocument();

    // The component should call router.replace to clean the URL
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/search/reports", { scroll: false }));
  });

  it("shows deleted toast and cleans URL when showDeletedToast is true", async () => {
    render(
      <SearchReportsClient
        initialReports={initialReports}
        totalPages={1}
        showDeletedToast={true}
        languageOptions={[]}
        countryOptions={[]}
        clinicOptions={[]}
        typeOptions={[]}
        therapistOptions={[]}
        patientOptions={[]}
      />
    );

    // The toast message should be visible
    const toast = await screen.findByText("Report deleted successfully!");
    expect(toast).toBeInTheDocument();

    // The component should call router.replace to clean the URL
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/search/reports", { scroll: false }));
  });

  it("retains search parameters when changing sort option", async () => {
    // Mock searchParams to simulate having a search query already in URL
    const mockSearchParams = new URLSearchParams("q=test+search");
    const mockGet = jest.fn((key: string) => mockSearchParams.get(key));
    const mockToString = jest.fn(() => mockSearchParams.toString());
    
    // Temporarily override the useSearchParams mock for this test
    const nextNav = jest.requireMock<typeof import("next/navigation")>("next/navigation");
    const originalUseSearchParams = nextNav.useSearchParams;
    nextNav.useSearchParams = jest.fn(() => ({
      get: mockGet,
      toString: mockToString,
    }));

    const { container } = render(
      <SearchReportsClient
        initialReports={initialReports}
        totalPages={1}
        initialSearchTerm="test search"
        languageOptions={[]}
        countryOptions={[]}
        clinicOptions={[]}
        typeOptions={[]}
        therapistOptions={[]}
        patientOptions={[]}
      />
    );

    // Verify the search input has the initial search term
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("test search");

    // Change sort option
    const selectContainer = container.querySelector('[class*="react-select"]');
    await userEvent.click(selectContainer!);

    const menu = await screen.findByRole("listbox");
    expect(menu).toBeInTheDocument();

    const titleAscOption = await screen.findByText("Sort by: Title (A-Z)");
    await userEvent.click(titleAscOption);

    // Verify URL update includes both search and sort parameters
    await waitFor(() => {
      const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1];
      expect(lastCall[0]).toContain("q=test+search");
      expect(lastCall[0]).toContain("sort=titleAscending");
      expect(lastCall[0]).toContain("p=1");
    });

    // Restore the original mock
    nextNav.useSearchParams = originalUseSearchParams;
  });

  // Translation functionality tests skipped - translation feature not implemented in SearchReportsClient
  // The component uses Next.js server-side filtering via URL parameters instead
});
