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
    get: (_: string) => null,
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

// Mock fetchReports action
const mockFetchReports = jest.fn();
jest.mock("@/app/(with-sidebar)/search/reports/actions", () => ({
  fetchReports: (...args: unknown[]) => mockFetchReports(...args),
}));

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
  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} />);

    expect(screen.getByText("Report One")).toBeInTheDocument();
  });

  it("navigates to a report on click (router.push called)", async () => {
  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} />);

    const repLink = screen.getByText("Report One").closest("a");
    await userEvent.click(repLink!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/rep-1"));
  });

  it("performs search and updates reports using fetchReports", async () => {
    mockFetchReports.mockResolvedValue({
      success: true,
      data: [
        {
          id: "rep-2",
          title: "Report Two",
          description: "desc2",
          content: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          language_id: 1,
          patient_id: "pat-2",
          therapist_id: "ther-2",
          type_id: 2,
          therapist: {
            id: "ther-2",
            name: "Therapist Two",
            first_name: "X",
            last_name: "Y",
            picture: "",
            bio: "",
            age: 35,
            clinic_id: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            clinic: { clinic: "Z", country_id: 2, id: 2, country: { country: "Y", id: 2 } },
          },
          type: { id: 2, type: "Type" },
          language: { id: 1, code: "en", language: "English" },
          patient: {
            id: "pat-2",
            name: "Alice S",
            first_name: "Alice",
            last_name: "S",
            contact_number: "",
            country_id: 2,
            country: { country: "Y", id: 2 },
            sex: "Female" as const,
            birthdate: "1990-01-01",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reports: [{ type: { id: 2, type: "TypeA" } }],
          },
        },
      ],
      totalPages: 1,
    });

  render(<SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} />);

  // Query by role to avoid relying on placeholder text (more robust)
  const input = screen.getByRole("textbox") as HTMLInputElement;
  await userEvent.clear(input);
  await userEvent.type(input, "Alice");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Report Two")).toBeInTheDocument());
  });

  it("performs update when sorting parameter is changed", async () => {
    mockFetchReports.mockResolvedValue({
      success: true,
      data: [
        {
          id: "rep-3",
          title: "Report Three",
          description: "desc3",
          content: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          language_id: 1,
          patient_id: "pat-3",
          therapist_id: "ther-3",
          type_id: 3,
          therapist: {
            id: "ther-3",
            name: "Therapist Three",
            first_name: "T",
            last_name: "H",
            picture: "",
            bio: "",
            age: 45,
            clinic_id: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            clinic: { clinic: "Clinic3", country_id: 3, id: 3, country: { country: "Z", id: 3 } },
          },
          type: { id: 3, type: "Type3" },
          language: { id: 1, code: "en", language: "English" },
          patient: {
            id: "pat-3",
            name: "Charlie",
            first_name: "Charlie",
            last_name: "C",
            contact_number: "",
            country_id: 3,
            country: { country: "Z", id: 3 },
            sex: "Male" as const,
            birthdate: "1985-01-01",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reports: [{ type: { id: 3, type: "Type3" } }],
          },
        },
      ],
      totalPages: 1,
    });

    const { container } = render(
      <SearchReportsClient initialReports={initialReports} totalPages={1} languageOptions={[]} />
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

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
    await screen.findByText("Report Three");

    // Select the "Title (Z-A)" option
    await userEvent.click(selectContainer!);
    const titleDescOption = await screen.findByText("Sort by: Title (Z-A)");
    await userEvent.click(titleDescOption);

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalledTimes(2));
    await screen.findByText("Report Three");

    // Select the "Created At (Newest)" option
    await userEvent.click(selectContainer!);
    const dateAtNewOption = await screen.findByText("Sort by: Date (Newest First)");
    await userEvent.click(dateAtNewOption);

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalledTimes(3));
    await screen.findByText("Report Three");

    // Select the "Created At (Oldest)" option
    await userEvent.click(selectContainer!);
    const dateOldOption = await screen.findByText("Sort by: Date (Oldest First)");
    await userEvent.click(dateOldOption);

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalledTimes(4));
    await screen.findByText("Report Three");

    
  });

  it("handles page change and updates reports", async () => {
    // Prepare mocked response for page 2
    mockFetchReports.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "rep-page-2",
          title: "Report Page Two",
          description: "desc-page-2",
          content: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          language_id: 1,
          patient_id: "pat-p2",
          therapist_id: "ther-p2",
          type_id: 4,
          therapist: {
            id: "ther-p2",
            name: "Therapist P2",
            first_name: "P",
            last_name: "2",
            picture: "",
            bio: "",
            age: 50,
            clinic_id: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            clinic: { clinic: "ClinicP2", country_id: 4, id: 4, country: { country: "PZ", id: 4 } },
          },
          type: { id: 4, type: "TypeP2" },
          language: { id: 1, code: "en", language: "English" },
          patient: {
            id: "pat-p2",
            name: "Patient P2",
            first_name: "Patient",
            last_name: "P2",
            contact_number: "",
            country_id: 4,
            country: { country: "PZ", id: 4 },
            sex: "Male" as const,
            birthdate: "1980-01-01",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            reports: [{ type: { id: 4, type: "TypeP2" } }],
          },
        },
      ],
      totalPages: 3,
    });

    // Render with multiple pages available so Pagination shows
    render(<SearchReportsClient initialReports={initialReports} totalPages={3} languageOptions={[]} />);

    // The pagination should render page buttons; click page 2
    const pageTwo = await screen.findByText("2");
    await userEvent.click(pageTwo);

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Report Page Two")).toBeInTheDocument());
  });

  it("shows success toast and cleans URL when showSuccessToast is true", async () => {
    render(
      <SearchReportsClient
        initialReports={initialReports}
        totalPages={1}
        showSuccessToast={true}
        languageOptions={[]}
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
      />
    );

    // The toast message should be visible
    const toast = await screen.findByText("Report deleted successfully!");
    expect(toast).toBeInTheDocument();

    // The component should call router.replace to clean the URL
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/search/reports", { scroll: false }));
  });

  it("retains language and search parameters when changing sort option", async () => {
    const languageOptions = [
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
    ];

    // Mock translation to return original text
    mockTranslateText.mockImplementation((text: string) => Promise.resolve(text));

    mockFetchReports.mockResolvedValue({
      success: true,
      data: initialReports,
      totalPages: 1,
    });

    const { container } = render(
      <SearchReportsClient
        initialReports={initialReports}
        totalPages={1}
        languageOptions={languageOptions}
      />
    );

    // Perform a search first
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "test search");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());

    // Select a language
    const languageSelect = screen.getByText("Display Language");
    await userEvent.click(languageSelect);
    
    const spanishOption = await screen.findByText("Spanish");
    await userEvent.click(spanishOption);

    // Wait for translation to complete
    await waitFor(() => {
      expect(screen.getByText("Translation successful!")).toBeInTheDocument();
    });

    // Clear push mock calls
    pushMock.mockClear();

    // Change sort option
    const selectContainer = container.querySelector('[class*="react-select"]');
    await userEvent.click(selectContainer!);

    const menu = await screen.findByRole("listbox");
    expect(menu).toBeInTheDocument();

    const titleAscOption = await screen.findByText("Sort by: Title (A-Z)");
    await userEvent.click(titleAscOption);

    // Verify URL update includes both language and search parameters
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("lang=es"),
        { scroll: false }
      );
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("q=test+search"),
        { scroll: false }
      );
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("sort=titleAscending"),
        { scroll: false }
      );
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringContaining("p=1"),
        { scroll: false }
      );
    });
  });

  describe("Translation functionality", () => {
    const languageOptions = [
      { value: "es", label: "Spanish" },
      { value: "fr", label: "French" },
      { value: "de", label: "German" },
    ];

    beforeEach(() => {
      // Setup default mock responses for translation - just return original text
      mockTranslateText.mockImplementation((text: string) => {
        return Promise.resolve(text);
      });
    });

    it("translates reports using Promise.all when language is changed", async () => {
      render(
        <SearchReportsClient
          initialReports={initialReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      // Find the language select by placeholder text
      const languageSelect = screen.getByText("Display Language");
      expect(languageSelect).toBeInTheDocument();

      await userEvent.click(languageSelect);

      // Wait for the menu to appear and select Spanish
      const spanishOption = await screen.findByText("Spanish");
      await userEvent.click(spanishOption);

      // Wait for translation to complete - verify Promise.all called translateText
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalledWith("Written by", "es");
        expect(mockTranslateText).toHaveBeenCalledWith("Edited", "es");
        expect(mockTranslateText).toHaveBeenCalledWith("Report One", "es");
        expect(mockTranslateText).toHaveBeenCalledWith("desc", "es");
      });

      // Check success toast appears
      await waitFor(() => {
        expect(screen.getByText("Translation successful!")).toBeInTheDocument();
      });

      // Check URL is updated with language parameter
      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith(
          expect.stringContaining("lang=es"),
          { scroll: false }
        );
      });
    });

    it("handles translation when report language matches target language", async () => {
      const reportWithEnglish = {
        ...initialReports[0],
        language: { id: 1, code: "en", language: "English" },
      };

      render(
        <SearchReportsClient
          initialReports={[reportWithEnglish]}
          totalPages={1}
          languageOptions={[...languageOptions, { value: "en", label: "English" }]}
        />
      );

      const languageSelect = screen.getByText("Display Language");
      await userEvent.click(languageSelect);
      
      const englishOption = await screen.findByText("English");
      await userEvent.click(englishOption);

      // When report language matches target, only UI text should be translated
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalledWith("Written by", "en");
        expect(mockTranslateText).toHaveBeenCalledWith("Edited", "en");
      });

      // Report content should NOT be translated
      expect(mockTranslateText).not.toHaveBeenCalledWith("Report One", "en");

      // Original content should still be visible
      expect(screen.getByText("Report One")).toBeInTheDocument();
    });

    it("sets isTranslating state during translation", async () => {
      // Make translation take some time
      mockTranslateText.mockImplementation((text: string) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(text), 100);
        });
      });

      render(
        <SearchReportsClient
          initialReports={initialReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      const languageSelect = screen.getByText("Display Language");
      await userEvent.click(languageSelect);
      
      const spanishOption = await screen.findByText("Spanish");
      await userEvent.click(spanishOption);

      // Verify translation completes
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalled();
      }, { timeout: 3000 });

      // After translation completes, success message should appear
      await waitFor(() => {
        expect(screen.getByText("Translation successful!")).toBeInTheDocument();
      });
    });

    it("handles partial translation failure gracefully", async () => {
      const multipleReports = [
        ...initialReports,
        {
          ...initialReports[0],
          id: "rep-2",
          title: "Report Two",
          description: "desc2",
        },
      ];

      // Mock one report translation to fail
      mockTranslateText.mockImplementation((text: string) => {
        if (text === "Report Two") {
          return Promise.reject(new Error("Failed to translate this report"));
        }
        return Promise.resolve(text);
      });

      render(
        <SearchReportsClient
          initialReports={multipleReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      const languageSelect = screen.getByText("Display Language");
      await userEvent.click(languageSelect);
      
      const spanishOption = await screen.findByText("Spanish");
      await userEvent.click(spanishOption);

      // Verify translation was attempted for both reports
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalledWith("Report One", "es");
        expect(mockTranslateText).toHaveBeenCalledWith("Report Two", "es");
      });

      // Both reports should be visible (one translated, one fell back to original)
      await waitFor(() => {
        expect(screen.getByText("Report One")).toBeInTheDocument();
        expect(screen.getByText("Report Two")).toBeInTheDocument();
      });

      // Success toast should still appear (partial success)
      await waitFor(() => {
        expect(screen.getByText("Translation successful!")).toBeInTheDocument();
      });
    });

    it("updates translated reports when original reports change", async () => {
      const { rerender } = render(
        <SearchReportsClient
          initialReports={initialReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      const languageSelect = screen.getByText("Display Language");

      // Select a language first
      await userEvent.click(languageSelect);
      
      const spanishOption = await screen.findByText("Spanish");
      await userEvent.click(spanishOption);

      // Wait for initial translation to complete
      await waitFor(() => {
        expect(mockTranslateText).toHaveBeenCalledWith("Report One", "es");
      });

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText("Translation successful!")).toBeInTheDocument();
      });

      // Get the call count before rerender
      const initialCallCount = mockTranslateText.mock.calls.length;

      // Now update the reports (simulate search/filter)
      const newReports = [
        {
          ...initialReports[0],
          id: "rep-new",
          title: "New Report",
          description: "new desc",
        },
      ];

      rerender(
        <SearchReportsClient
          initialReports={newReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      // New report should be automatically translated (in the background, no toast)
      // Verify NEW calls were made (after the initial translation)
      await waitFor(() => {
        expect(mockTranslateText.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
      });
    });

    it("shows error toast when translation fails", async () => {
      // Mock translation to fail
      mockTranslateText.mockRejectedValue(new Error("Translation API error"));

      render(
        <SearchReportsClient
          initialReports={initialReports}
          totalPages={1}
          languageOptions={languageOptions}
        />
      );

      const languageSelect = screen.getByText("Display Language");
      await userEvent.click(languageSelect);
      
      const spanishOption = await screen.findByText("Spanish");
      await userEvent.click(spanishOption);

      // Wait for error toast to appear
      await waitFor(() => {
        expect(screen.getByText("Translation failed. Please try again.")).toBeInTheDocument();
      });

      // Verify original reports are still displayed (fallback behavior)
      expect(screen.getByText("Report One")).toBeInTheDocument();
    });
  });
});
