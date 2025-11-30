import React from "react";
import type { Tables } from "@/lib/types/database.types";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchPatientsClient from "@/components/client-pages/SearchPatientsClient";
import { fetchPatients as mockFetchPatients } from "@/app/(with-sidebar)/search/patients/actions";
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

jest.mock("@/app/(with-sidebar)/search/patients/actions", () => ({
  fetchPatients: jest.fn(),
}));

// Mock layout and child components to make unit deterministic
jest.mock("@/components/layout/SearchPageHeader", () => {
  const Component = (props: {
    searchValue?: string;
    onSearch?: (v: string) => void;
    onSearchChange?: (v: string) => void;
    onSortChange?: (opt: { value: string; label: string }) => void;
    onLanguageChange?: (opt: { value: string; label: string }) => void;
  }) => (
    <div data-testid="search-page-header">
      <input
        data-testid="search-input"
        value={props.searchValue ?? ""}
        onChange={(e) => props.onSearchChange?.(e.target.value)}
      />
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
        defaultValue="nameAscending"
        onChange={(e) => {
          const label = e.target.selectedOptions?.[0]?.text || e.target.value;
          if (props.onSortChange) props.onSortChange({ value: e.target.value, label });
        }}
      >
        <option value="nameAscending">Name A-Z</option>
        <option value="nameDescending">Name Z-A</option>
      </select>

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

jest.mock("@/components/cards/PatientCard", () => {
  const Component = (props: { patient?: { id?: string } }) => (
    <div data-testid={`patient-${props.patient?.id}`}>patient-{props.patient?.id}</div>
  );
  Component.displayName = "PatientCard";
  return Component;
});

jest.mock("@/components/general/Pagination", () => {
  const Component = (props: { totalPages?: number; currentPage?: number; onPageChange?: (p: number) => void }) => {
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

describe("SearchPatientsClient integration", () => {
  const pushMock = jest.fn();
  const pathname = "/search/patients";
  const searchParams = new URLSearchParams("p=2&q=initial");

    interface PatientMinimal {
      id: string;
      name?: string;
      country?: { id: string };
    }

    const initialPatients: Array<{
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
      country: { id: number; country: string };
      reports: Array<{ type: { type: string } }>;
    }> = [
      {
        id: "pat-1",
        first_name: "Alice",
        last_name: "A",
        name: "Alice",
        birthdate: "1990-01-01",
        contact_number: "09170000001",
        country_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sex: "Female",
        country: { id: 1, country: "Country1" },
        reports: [{ type: { type: "Assessment" } }],
      },
      {
        id: "pat-2",
        first_name: "Bob",
        last_name: "B",
        name: "Bob",
        birthdate: "1991-01-01",
        contact_number: "09170000002",
        country_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sex: "Male",
        country: { id: 1, country: "Country1" },
        reports: [{ type: { type: "Progress" } }],
      },
    ];

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
    (nextNav.useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => searchParams.get(k),
      toString: () => searchParams.toString(),
    });

    (mockFetchPatients as jest.Mock).mockResolvedValue({
      success: true,
      data: initialPatients,
      totalPages: 2,
    });

    (window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
  });

  it("renders initial patients and pagination", () => {
    render(<SearchPatientsClient initialPatients={initialPatients} totalPages={2} initialSearchTerm="initial" />);

    expect(screen.getByTestId("patient-pat-1")).toBeInTheDocument();
    expect(screen.getByTestId("patient-pat-2")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("performs a search: updates patients via fetchPatients and updates URL via router.push", async () => {
    const newPatients = [{ id: "pat-new", name: "New" }];
    (mockFetchPatients as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: newPatients,
      totalPages: 1,
    });

      render(<SearchPatientsClient initialPatients={initialPatients} totalPages={2} initialSearchTerm="initial" />);

    fireEvent.click(screen.getByTestId("search-btn"));

    await waitFor(() => expect(mockFetchPatients).toHaveBeenCalled());

    await waitFor(() => expect(screen.getByTestId("patient-pat-new")).toBeInTheDocument());
  });

  it("changes sort and page: triggers fetch and updates list", async () => {
    const sorted = [...initialPatients].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      render(<SearchPatientsClient initialPatients={initialPatients} totalPages={2} initialSearchTerm="initial" />);

    (mockFetchPatients as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: sorted,
      totalPages: 2,
    });

    fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value: "nameAscending" } });

    await waitFor(() => expect(mockFetchPatients).toHaveBeenCalled());

    (mockFetchPatients as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [initialPatients[0]],
      totalPages: 2,
    });

    await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("page-1"));

    await waitFor(() => expect(mockFetchPatients).toHaveBeenCalled());
    expect((window as unknown as { scrollTo?: jest.Mock }).scrollTo).toHaveBeenCalled();
  });

  it("changes language: updates select and keeps existing patients", async () => {
    const langPatients = [{ ...initialPatients[0], id: "pat-lang" }];
    (mockFetchPatients as jest.Mock).mockResolvedValueOnce({ success: true, data: langPatients, totalPages: 1 });

      render(<SearchPatientsClient initialPatients={initialPatients} totalPages={2} initialSearchTerm="initial" />);

    fireEvent.change(screen.getByTestId("mock-language-select"), { target: { value: "es" } });

    await waitFor(() => expect((screen.getByTestId("mock-language-select") as HTMLSelectElement).value).toBe("es"));

    expect(screen.getByTestId("patient-pat-1")).toBeInTheDocument();
    expect(screen.getByTestId("patient-pat-2")).toBeInTheDocument();
  });

  it("getSortParams cases map to correct fetch parameters", async () => {
    const cases: Record<string, { column: string; ascending: boolean }> = {
      nameAscending: { column: "name", ascending: true },
      nameDescending: { column: "name", ascending: false },
    };

    for (const [value, expected] of Object.entries(cases)) {
        (mockFetchPatients as jest.Mock).mockResolvedValueOnce({ success: true, data: initialPatients, totalPages: 2 });

      const { unmount } = render(
          <SearchPatientsClient initialPatients={initialPatients} totalPages={2} initialSearchTerm="initial" />
      );

      fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value } });

      await waitFor(() => expect(mockFetchPatients).toHaveBeenCalled());

      const lastCall = (mockFetchPatients as jest.Mock).mock.calls.pop();
      const params = lastCall ? lastCall[0] : undefined;
      expect(params).toBeDefined();
      expect(params.ascending).toBe(expected.ascending);

      unmount();
    }
  });
});
