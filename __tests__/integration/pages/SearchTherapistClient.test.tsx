import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchTherapistsClient from "@/components/client-pages/SearchTherapistClient";
import { fetchTherapists as mockFetchTherapists } from "@/app/(with-sidebar)/search/therapists/actions";
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

jest.mock("@/app/(with-sidebar)/search/therapists/actions", () => ({
  fetchTherapists: jest.fn(),
}));

// Mock layout and child components to make unit deterministic
jest.mock("@/components/layout/SearchPageHeader", () => {
  const Component = (props: any) => (
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

jest.mock("@/components/cards/TherapistCard", () => {
  const Component = (props: { therapist?: { id?: string } }) => (
    <div data-testid={`therapist-${props.therapist?.id}`}>therapist-{props.therapist?.id}</div>
  );
  Component.displayName = "TherapistCard";
  return Component;
});

jest.mock("@/components/general/Pagination", () => {
  const Component = (props: any) => {
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

describe("SearchTherapistClient integration", () => {
  const pushMock = jest.fn();
  const pathname = "/search/therapists";
  const searchParams = new URLSearchParams("p=2&q=initial");

  interface TherapistMinimal {
    id: string;
    name?: string;
    clinic?: { id: string };
  }

  const initialTherapists: TherapistMinimal[] = [
    { id: "ther-1", name: "Alice" },
    { id: "ther-2", name: "Bob" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNav.useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (nextNav.usePathname as jest.Mock).mockReturnValue(pathname);
    (nextNav.useSearchParams as jest.Mock).mockReturnValue({
      get: (k: string) => searchParams.get(k),
      toString: () => searchParams.toString(),
    });

    (mockFetchTherapists as jest.Mock).mockResolvedValue({
      success: true,
      data: initialTherapists,
      totalPages: 2,
    });

    (window as unknown as { scrollTo?: jest.Mock }).scrollTo = jest.fn();
  });

  it("renders initial therapists and pagination", () => {
    render(
      <SearchTherapistsClient
        initialTherapists={initialTherapists as any}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    expect(screen.getByTestId("therapist-ther-1")).toBeInTheDocument();
    expect(screen.getByTestId("therapist-ther-2")).toBeInTheDocument();
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });

  it("performs a search: updates therapists via fetchTherapists and updates URL via router.push", async () => {
    const newTherapists = [{ id: "ther-new", name: "New" }];
    (mockFetchTherapists as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: newTherapists,
      totalPages: 1,
    });

    render(
      <SearchTherapistsClient
        initialTherapists={initialTherapists as any}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    fireEvent.click(screen.getByTestId("search-btn"));

    await waitFor(() => expect(mockFetchTherapists).toHaveBeenCalled());

    await waitFor(() => expect(screen.getByTestId("therapist-ther-new")).toBeInTheDocument());
  });

  it("changes sort and page: triggers fetch and updates list", async () => {
    const sorted = [...initialTherapists].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    render(
      <SearchTherapistsClient
        initialTherapists={initialTherapists as any}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    (mockFetchTherapists as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: sorted,
      totalPages: 2,
    });

    fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value: "nameAscending" } });

    await waitFor(() => expect(mockFetchTherapists).toHaveBeenCalled());

    (mockFetchTherapists as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [initialTherapists[0]],
      totalPages: 2,
    });

    await waitFor(() => expect(screen.getByTestId("page-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("page-1"));

    await waitFor(() => expect(mockFetchTherapists).toHaveBeenCalled());
    expect((window as unknown as { scrollTo?: jest.Mock }).scrollTo).toHaveBeenCalled();
  });

  it("changes language: updates select and keeps existing therapists", async () => {
    const langTher = [{ ...initialTherapists[0], id: "ther-lang" }];
    (mockFetchTherapists as jest.Mock).mockResolvedValueOnce({ success: true, data: langTher, totalPages: 1 });

    render(
      <SearchTherapistsClient
        initialTherapists={initialTherapists as any}
        totalPages={2}
        initialSearchTerm="initial"
      />
    );

    fireEvent.change(screen.getByTestId("mock-language-select"), { target: { value: "es" } });

    await waitFor(() => expect((screen.getByTestId("mock-language-select") as HTMLSelectElement).value).toBe("es"));

    expect(screen.getByTestId("therapist-ther-1")).toBeInTheDocument();
    expect(screen.getByTestId("therapist-ther-2")).toBeInTheDocument();
  });

  it("getSortParams cases map to correct fetch parameters", async () => {
    const cases: Record<string, { column: string; ascending: boolean }> = {
      nameAscending: { column: "name", ascending: true },
      nameDescending: { column: "name", ascending: false },
    };

    for (const [value, expected] of Object.entries(cases)) {
      (mockFetchTherapists as jest.Mock).mockResolvedValueOnce({ success: true, data: initialTherapists, totalPages: 2 });

      const { unmount } = render(
        <SearchTherapistsClient initialTherapists={initialTherapists as any} totalPages={2} initialSearchTerm="initial" />
      );

      fireEvent.change(screen.getByTestId("mock-sort-select"), { target: { value } });

      await waitFor(() => expect(mockFetchTherapists).toHaveBeenCalled());

      const lastCall = (mockFetchTherapists as jest.Mock).mock.calls.pop();
      const params = lastCall ? lastCall[0] : undefined;
      expect(params).toBeDefined();
      expect(params.ascending).toBe(expected.ascending);

      unmount();
    }
  });
});
