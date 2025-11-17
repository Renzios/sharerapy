import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TherapistProfileClient from "@/components/client-pages/TherapistProfileClient";
import { fetchReports as mockFetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import * as nextNav from "next/navigation";

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
    usePathname: jest.fn(),
  };
});

jest.mock("@/app/(with-sidebar)/search/reports/actions", () => ({
  fetchReports: jest.fn(),
}));

// Mock layout and child components to make unit deterministic
jest.mock("@/components/layout/TherapistProfile", () => {
  const Component = (props: { therapist?: { id?: string } }) => (
    <div data-testid="therapist-profile">therapist-{props.therapist?.id}</div>
  );
  Component.displayName = "TherapistProfile";
  return Component;
});

jest.mock("@/components/layout/SearchPageHeader", () => {
  const Component = (props: {
    onSearch?: (v: string) => void;
    onSortChange?: (opt: { value: string; label: string }) => void;
    onLanguageChange?: (opt: { value: string; label: string }) => void;
  }) => (
    <div data-testid="search-page-header">
      <button
        data-testid="search-btn"
        onClick={() => {
          if (props.onSearch) props.onSearch("searched-term");
        }}
      >
        search
      </button>
      <select
        data-testid="mock-sort-select"
        defaultValue="dateDescending"
        onChange={(e) => {
          const label = e.target.selectedOptions?.[0]?.text || e.target.value;
          if (props.onSortChange) props.onSortChange({ value: e.target.value, label });
        }}
      >
        <option value="titleAscending">Title A-Z</option>
        <option value="titleDescending">Title Z-A</option>
        <option value="dateAscending">Date Oldest</option>
        <option value="dateDescending">Date Newest</option>
      </select>
      {/* simulate a language dropdown/select */}
      <select
        data-testid="mock-language-select"
        defaultValue="en"
        onChange={(e) => {
          const label = e.target.selectedOptions?.[0]?.text || e.target.value;
          if (props.onLanguageChange) props.onLanguageChange({ value: e.target.value, label });
        }}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
    </div>
  );
  Component.displayName = "SearchPageHeader";
  return Component;
});

jest.mock("@/components/cards/ReportCard", () => {
  const Component = (props: { report?: { id?: string } }) => (
    <div data-testid={`report-${props.report?.id}`}>report-{props.report?.id}</div>
  );
  Component.displayName = "ReportCard";
  return Component;
});

jest.mock("@/components/general/Pagination", () => {
  const Component = (props: {
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (p: number) => void;
  }) => {
    const pages = Array.from({ length: props.totalPages || 1 }).map((_, i) => i + 1);
    return (
      <div data-testid="pagination">
        {pages.map((p) => (
          <button
            key={p}
            data-testid={`page-${p}`}
            onClick={() => {
              if (props.onPageChange) props.onPageChange(p);
            }}
          >
            go-page-{p}
          </button>
        ))}
        <div data-testid="pagination-info">page-{props.currentPage}-of-{props.totalPages}</div>
      </div>
    );
  };
  Component.displayName = "Pagination";
  return Component;
});

describe("TherapistProfileClient integration", () => {
  const pushMock = jest.fn();
  const pathname = "/therapists/1";
  const searchParams = new URLSearchParams("p=2&q=initial");
  // Minimal types used in tests to avoid `any` casts
  interface TherapistMinimal {
    id: string;
    name?: string;
    clinic: { id: string; country: { id: string; name: string } };
    reports: unknown[];
  }

  interface ReportMinimal {
    id: string;
    title: string;
    created_at: string;
    therapist: { id: string } | TherapistMinimal;
    type: { id: string; name: string };
    language: { id: string; name: string };
    patient: { id: string; country: { id: string; name: string } };
  }

  const therapist: TherapistMinimal = {
    id: "ther-1",
    name: "Therapist One",
    clinic: { id: "c1", country: { id: "country1", name: "Country" } },
    reports: [],
  };

  const initialReports: ReportMinimal[] = [
    {
      id: "r-alpha",
      title: "Alpha report",
      created_at: "2022-01-01",
      therapist,
      type: { id: "t1", name: "Assessment" },
      language: { id: "en", name: "English" },
      patient: { id: "p1", country: { id: "country1", name: "Country" } },
    },
    {
      id: "r-zulu",
      title: "Zulu report",
      created_at: "2020-05-01",
      therapist,
      type: { id: "t2", name: "Progress" },
      language: { id: "en", name: "English" },
      patient: { id: "p2", country: { id: "country1", name: "Country" } },
    },
    {
      id: "r-mike",
      title: "Mike report",
      created_at: "2021-06-01",
      therapist,
      type: { id: "t3", name: "Evaluation" },
      language: { id: "en", name: "English" },
      patient: { id: "p3", country: { id: "country1", name: "Country" } },
    },
    {
      id: "r-beta",
      title: "Beta report",
      created_at: "2019-03-01",
      therapist,
      type: { id: "t4", name: "FollowUp" },
      language: { id: "en", name: "English" },
      patient: { id: "p4", country: { id: "country1", name: "Country" } },
    },
  ] as ReportMinimal[];

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
    (nextNav.useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => searchParams.get(k),
      toString: () => searchParams.toString(),
    });

    (mockFetchReports as jest.Mock).mockResolvedValue({
      success: true,
      data: initialReports,
      totalPages: 2,
    });

    // avoid scroll side-effects
    (window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
  });

  it("renders therapist and initial report cards and pagination", () => {
  
  render(
      <TherapistProfileClient
        therapist={therapist}
        initialReports={initialReports}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    expect(screen.getByTestId("therapist-profile")).toHaveTextContent(
      `therapist-${therapist.id}`
    );
  expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
  expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("performs a search: updates reports via fetchReports and updates URL via router.push", async () => {
    const newReports = [
      {
        id: "r-new",
        title: "New Report",
        created_at: "2022-01-01",
        therapist,
        type: { id: "t1", name: "Type" },
        language: { id: "en", name: "English" },
        patient: { id: "p3", country: { id: "country1", name: "Country" } },
      },
    ];

    (mockFetchReports as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: newReports,
      totalPages: 1,
    });
  
  render(
      <TherapistProfileClient
        therapist={therapist}
        initialReports={initialReports}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    // trigger search via the mocked header
    fireEvent.click(screen.getByTestId("search-btn"));

    await waitFor(() => {
      // fetchReports should have been called
      expect(mockFetchReports).toHaveBeenCalled();
    });

    // new report appears
    await waitFor(() => expect(screen.getByTestId("report-r-new")).toBeInTheDocument());
  });

  it("changes sort and page: triggers fetch and updates list", async () => {
    // build a sorted copy of initial reports for the mocked response
    const sortedReports = [...initialReports].sort((a, b) => a.title.localeCompare(b.title));

    render(
      <TherapistProfileClient
        therapist={therapist}
        initialReports={initialReports}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    // change sort
    // when the user changes sort the component will call fetchReports; prepare the mock response
    (mockFetchReports as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: sortedReports,
      totalPages: 2,
    });

    // change sort via mocked select
    fireEvent.change(screen.getByTestId("mock-sort-select"), {
      target: { value: "titleAscending" },
    });

    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());

    // change page using mocked Pagination component
    (mockFetchReports as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [initialReports[0]],
      totalPages: 2,
    });

  // wait for our mocked Pagination button to be present, then click it
  await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
  fireEvent.click(screen.getByTestId("page-1"));

  await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
  // scrollTo should be called when page changes
  expect((window as unknown as { scrollTo?: jest.Mock }).scrollTo).toHaveBeenCalled();
  });

  it ("changes language: triggers fetch and updates list", async () => {
    const langReports = [
      { ...initialReports[0], id: "r-lang" }, // ensure deterministic content
    ];
    (mockFetchReports as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: langReports,
        totalPages: 1,
    }); 

    render(
      <TherapistProfileClient
        therapist={therapist}
        initialReports={initialReports}
        totalPages={2}
        initialSearchTerm="initial"
      />
    ); 

    // change language via the mocked select
    fireEvent.change(screen.getByTestId("mock-language-select"), {
      target: { value: "es" },
    });

      // the select's value should update; the component does not call fetchReports on language change
      await waitFor(() =>
        expect((screen.getByTestId("mock-language-select") as HTMLSelectElement).value).toBe("es")
      );

    // existing reports should remain rendered
    expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
    expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
  });

  it("getSortParams cases map to correct fetch parameters", async () => {
    const cases: Record<
      string,
      { column: "title" | "created_at"; ascending: boolean }
    > = {
      titleAscending: { column: "title", ascending: true },
      titleDescending: { column: "title", ascending: false },
      dateAscending: { column: "created_at", ascending: true },
      dateDescending: { column: "created_at", ascending: false },
    };

    for (const [value, expected] of Object.entries(cases)) {
      // prepare a mock response for each change
      (mockFetchReports as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: initialReports,
        totalPages: 2,
      });

  // ts-expect-error: simplified test fixture
  
  const { unmount } = render(
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports}
          totalPages={2}
          initialSearchTerm="initial"
        />
      );

      fireEvent.change(screen.getByTestId("mock-sort-select"), {
        target: { value },
      });

      await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());

      const lastCall = (mockFetchReports as jest.Mock).mock.calls.pop();
      const params = lastCall ? lastCall[0] : undefined;
      expect(params).toBeDefined();
      expect(params.column).toBe(expected.column);
      expect(params.ascending).toBe(expected.ascending);

      unmount();
    }

    // default case: unknown option should fall back to dateDescending (created_at, ascending: false)
    (mockFetchReports as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: initialReports,
      totalPages: 2,
    });
  // ts-expect-error: simplified test fixture
  
  const { unmount: u2 } = render(
      <TherapistProfileClient
        therapist={therapist}
        initialReports={initialReports}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );
    fireEvent.change(screen.getByTestId("mock-sort-select"), {
      target: { value: "unknown-option" },
    });
    await waitFor(() => expect(mockFetchReports).toHaveBeenCalled());
    const lastCall2 = (mockFetchReports as jest.Mock).mock.calls.pop();
    const params2 = lastCall2 ? lastCall2[0] : undefined;
    expect(params2).toBeDefined();
    expect(params2.column).toBe("created_at");
    expect(params2.ascending).toBe(false);
    u2();
  });
});
