import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as nextNav from "next/navigation";


jest.mock('openai');
// Mocks must be defined before importing the components that use them
jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
    usePathname: jest.fn(),
  };
});

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  })),
}));

jest.mock("@/lib/client/therapists", () => ({
  fetchTherapist: jest.fn().mockResolvedValue(null),
}));

// Now import the components after mocks are set up
import TherapistProfileClient from "@/components/client-pages/TherapistProfileClient";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { TherapistProfileProvider } from "@/app/contexts/TherapistProfileContext";

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
  // Minimal types used in tests
  type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
  
  interface TherapistMinimal {
    id: string;
    name: string;
    age: number;
    bio: string;
    clinic_id: number;
    created_at: string;
    first_name: string;
    last_name: string;
    picture: string;
    updated_at: string;
    clinic: {
      clinic: string;
      country_id: number;
      id: number;
      country: {
        country: string;
        id: number;
      };
    };
    reports: ReportMinimal[];
  }

  interface ReportMinimal {
    id: string;
    title: string;
    content: Json;
    created_at: string;
    description: string;
    language_id: number;
    patient_id: string;
    therapist_id: string;
    type_id: number;
    updated_at: string;
    therapist: {
      id: string;
      name: string;
      age: number;
      bio: string;
      clinic_id: number;
      created_at: string;
      first_name: string;
      last_name: string;
      picture: string;
      updated_at: string;
      clinic: {
        clinic: string;
        country_id: number;
        id: number;
        country: {
          country: string;
          id: number;
        };
      };
    };
    type: {
      id: number;
      type: string;
    };
    language: {
      id: number;
      language: string;
      code: string;
    };
    patient: {
      id: string;
      first_name: string;
      last_name: string;
      name: string;
      birthdate: string;
      contact_number: string;
      country_id: number;
      created_at: string;
      updated_at: string;
      sex: "Male" | "Female";
      country: {
        country: string;
        id: number;
      };
    };
  }

  const therapist: TherapistMinimal = {
    id: "ther-1",
    name: "Therapist One",
    age: 35,
    bio: "Test bio",
    clinic_id: 1,
    created_at: "2020-01-01T00:00:00Z",
    first_name: "Therapist",
    last_name: "One",
    picture: "picture.jpg",
    updated_at: "2020-01-01T00:00:00Z",
    clinic: {
      clinic: "Test Clinic",
      country_id: 1,
      id: 1,
      country: {
        country: "Test Country",
        id: 1,
      },
    },
    reports: [],
  };

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
  ];

  const initialReports: ReportMinimal[] = [
    {
      id: "r-alpha",
      title: "Alpha report",
      content: {},
      created_at: "2022-01-01",
      description: "Alpha description",
      language_id: 1,
      patient_id: "p1",
      therapist_id: "ther-1",
      type_id: 1,
      updated_at: "2022-01-01",
      therapist,
      type: { id: 1, type: "Assessment" },
      language: { id: 1, language: "English", code: "en" },
      patient: {
        id: "p1",
        first_name: "Patient",
        last_name: "One",
        name: "Patient One",
        birthdate: "2000-01-01",
        contact_number: "1234567890",
        country_id: 1,
        created_at: "2020-01-01",
        updated_at: "2020-01-01",
        sex: "Male",
        country: { country: "Test Country", id: 1 },
      },
    },
    {
      id: "r-zulu",
      title: "Zulu report",
      content: {},
      created_at: "2020-05-01",
      description: "Zulu description",
      language_id: 1,
      patient_id: "p2",
      therapist_id: "ther-1",
      type_id: 2,
      updated_at: "2020-05-01",
      therapist,
      type: { id: 2, type: "Progress" },
      language: { id: 1, language: "English", code: "en" },
      patient: {
        id: "p2",
        first_name: "Patient",
        last_name: "Two",
        name: "Patient Two",
        birthdate: "2000-01-01",
        contact_number: "1234567890",
        country_id: 1,
        created_at: "2020-01-01",
        updated_at: "2020-01-01",
        sex: "Female",
        country: { country: "Test Country", id: 1 },
      },
    },
    {
      id: "r-mike",
      title: "Mike report",
      content: {},
      created_at: "2021-06-01",
      description: "Mike description",
      language_id: 1,
      patient_id: "p3",
      therapist_id: "ther-1",
      type_id: 3,
      updated_at: "2021-06-01",
      therapist,
      type: { id: 3, type: "Evaluation" },
      language: { id: 1, language: "English", code: "en" },
      patient: {
        id: "p3",
        first_name: "Patient",
        last_name: "Three",
        name: "Patient Three",
        birthdate: "2000-01-01",
        contact_number: "1234567890",
        country_id: 1,
        created_at: "2020-01-01",
        updated_at: "2020-01-01",
        sex: "Male",
        country: { country: "Test Country", id: 1 },
      },
    },
    {
      id: "r-beta",
      title: "Beta report",
      content: {},
      created_at: "2019-03-01",
      description: "Beta description",
      language_id: 1,
      patient_id: "p4",
      therapist_id: "ther-1",
      type_id: 4,
      updated_at: "2019-03-01",
      therapist,
      type: { id: 4, type: "FollowUp" },
      language: { id: 1, language: "English", code: "en" },
      patient: {
        id: "p4",
        first_name: "Patient",
        last_name: "Four",
        name: "Patient Four",
        birthdate: "2000-01-01",
        contact_number: "1234567890",
        country_id: 1,
        created_at: "2020-01-01",
        updated_at: "2020-01-01",
        sex: "Female",
        country: { country: "Test Country", id: 1 },
      },
    },
  ];

  // Wrapper component to provide necessary contexts
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <TherapistProfileProvider>{children}</TherapistProfileProvider>
    </AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
    (nextNav.useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => searchParams.get(k),
      toString: () => searchParams.toString(),
    });

    // avoid scroll side-effects
    (window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
  });

  it("renders therapist and initial report cards and pagination", () => {
  
  render(
      <TestWrapper>
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports}
          totalPages={2}
          initialSearchTerm="initial"
          languageOptions={languageOptions}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId("therapist-profile")).toHaveTextContent(
      `therapist-${therapist.id}`
    );
  expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
  expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("performs a search: updates URL via router.push", async () => {
    render(
      <TestWrapper>
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports}
          totalPages={2}
          initialSearchTerm="initial"
          languageOptions={languageOptions}
        />
      </TestWrapper>
    );

    // trigger search via the mocked header
    fireEvent.click(screen.getByTestId("search-btn"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1][0];
      expect(lastCall).toContain("q=searched-term");
      expect(lastCall).toContain("p=1");
    });
  });

  it("changes sort and page: updates URL via router.push", async () => {
    render(
      <TestWrapper>
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports}
          totalPages={2}
          initialSearchTerm="initial"
          languageOptions={languageOptions}
        />
      </TestWrapper>
    );

    // change sort via mocked select
    fireEvent.change(screen.getByTestId("mock-sort-select"), {
      target: { value: "titleAscending" },
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1][0];
      expect(lastCall).toContain("sort=titleAscending");
      expect(lastCall).toContain("p=1");
    });

    // wait for our mocked Pagination button to be present, then click it
    await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("page-1"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1][0];
      expect(lastCall).toContain("p=1");
    });
    // scrollTo should be called when page changes
    expect((window as unknown as { scrollTo?: jest.Mock }).scrollTo).toHaveBeenCalled();
  });

  it ("changes language: updates select value", async () => {
    render(
      <TestWrapper>
        <TherapistProfileClient
          therapist={therapist}
          initialReports={initialReports}
          totalPages={2}
          initialSearchTerm="initial"
          languageOptions={languageOptions}
        />
      </TestWrapper>
    ); 

    // change language via the mocked select
    fireEvent.change(screen.getByTestId("mock-language-select"), {
      target: { value: "es" },
    });

    // the select's value should update
    await waitFor(() =>
      expect((screen.getByTestId("mock-language-select") as HTMLSelectElement).value).toBe("es")
    );

    // existing reports should remain rendered
    expect(screen.getByTestId("report-r-alpha")).toBeInTheDocument();
    expect(screen.getByTestId("report-r-zulu")).toBeInTheDocument();
  });

  it("sort options update URL with correct sort parameter", async () => {
    const sortValues = [
      "titleAscending",
      "titleDescending",
      "dateAscending",
      "dateDescending",
    ];

    for (const value of sortValues) {
      const { unmount } = render(
        <TestWrapper>
          <TherapistProfileClient
            therapist={therapist}
            initialReports={initialReports}
            totalPages={2}
            initialSearchTerm="initial"
            languageOptions={languageOptions}
          />
        </TestWrapper>
      );

      fireEvent.change(screen.getByTestId("mock-sort-select"), {
        target: { value },
      });

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalled();
        const lastCall = pushMock.mock.calls[pushMock.mock.calls.length - 1][0];
        expect(lastCall).toContain(`sort=${value}`);
      });

      unmount();
      jest.clearAllMocks();
    }

  });
});
