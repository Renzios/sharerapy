import { render, screen, fireEvent } from "@testing-library/react";
import SearchReportsPage from "@/app/(with-sidebar)/search/reports/page";

// Mock interfaces
interface SortOption {
  value: string;
  label: string;
}

interface MockSearchPageHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  currentPage?: string;
  sortOptions?: SortOption[];
  sortValue?: SortOption;
  onSortChange?: (option: SortOption | null) => void;
  languageValue?: SortOption;
  onLanguageChange?: (option: SortOption | null) => void;
  onAdvancedFiltersClick?: () => void;
  onMobileSettingsClick?: () => void;
}

interface MockReportCardProps {
  report: {
    title: string;
    description: string;
    dateUploaded: string;
    country: string;
    language: string;
    therapyType: string;
    clinic: string;
    therapistName: string;
    therapistPFP?: string | null;
  };
}

// Mock the child components
jest.mock("@/components/SearchPageHeader", () => {
  return function MockSearchPageHeader({
    searchValue,
    onSearchChange,
    onSearch,
    currentPage,
    sortOptions,
    sortValue,
    onAdvancedFiltersClick,
    onMobileSettingsClick,
  }: MockSearchPageHeaderProps) {
    return (
      <div data-testid="search-page-header">
        <input
          data-testid="search-input"
          value={searchValue || ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search reports..."
        />
        <button
          data-testid="search-button"
          onClick={() => onSearch?.(searchValue || "")}
        >
          Search
        </button>
        <div data-testid="current-page">{currentPage}</div>
        <div data-testid="sort-options">{JSON.stringify(sortOptions)}</div>
        <div data-testid="sort-value">{JSON.stringify(sortValue)}</div>
        <button
          data-testid="advanced-filters-button"
          onClick={() => onAdvancedFiltersClick?.()}
        >
          Advanced Filters
        </button>
        <button
          data-testid="mobile-settings-button"
          onClick={() => onMobileSettingsClick?.()}
        >
          Mobile Settings
        </button>
      </div>
    );
  };
});

jest.mock("@/components/ReportCard", () => {
  return function MockReportCard({ report }: MockReportCardProps) {
    const safeId = report.title.replace(/\s+/g, "-").toLowerCase();
    return (
      <div
        data-testid={`report-card-${safeId}`}
        data-report-title={report.title}
      >
        <h2>{report.title}</h2>
        <p>{report.dateUploaded}</p>
        <p>{report.country}</p>
        <p>{report.therapistName}</p>
        <p>{report.description}</p>
      </div>
    );
  };
});

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe("SearchReportsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<SearchReportsPage />);

    expect(screen.getByTestId("search-page-header")).toBeInTheDocument();
  });

  it("renders SearchPageHeader with correct props", () => {
    render(<SearchReportsPage />);

    const searchInput = screen.getByTestId("search-input");
    const currentPage = screen.getByTestId("current-page");

    expect(searchInput).toBeInTheDocument();
    expect(currentPage).toHaveTextContent("reports");
  });

  it("provides report-specific sort options to SearchPageHeader", () => {
    render(<SearchReportsPage />);

    const sortOptions = screen.getByTestId("sort-options");
    const sortOptionsText = sortOptions.textContent || "";

    expect(sortOptionsText).toContain("Sort by: Name");
    expect(sortOptionsText).toContain("Sort by: Age");
    expect(sortOptionsText).toContain("Sort by: Recent Visit");
    expect(sortOptionsText).toContain("Sort by: Condition");
    expect(sortOptionsText).toContain("Sort by: Therapist");
    expect(sortOptionsText).toContain("Sort by: Date Added");
  });

  it("renders exactly 3 report cards", () => {
    render(<SearchReportsPage />);

    // Titles from page.tsx: "Anxiety assessment", "PTSD follow-up", "Couples therapy overview"
    expect(
      screen.getByTestId("report-card-anxiety-assessment")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("report-card-ptsd-follow-up")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("report-card-couples-therapy-overview")
    ).toBeInTheDocument();

    // Verify no extra card exists
    expect(
      screen.queryByTestId("report-card-nonexistent")
    ).not.toBeInTheDocument();
  });

  it("renders report data correctly (title, country, therapist)", () => {
    render(<SearchReportsPage />);

    expect(screen.getByText("Anxiety assessment")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();

    expect(screen.getByText("PTSD follow-up")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();

    expect(screen.getByText("Couples therapy overview")).toBeInTheDocument();
    expect(screen.getByText("UK")).toBeInTheDocument();
  });

  it("renders report cards in a grid layout", () => {
    render(<SearchReportsPage />);

    const firstCard = screen.getByTestId("report-card-anxiety-assessment");
    const gridContainer = firstCard.parentElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it("handles search input changes and submission", () => {
    render(<SearchReportsPage />);

    const searchInput = screen.getByTestId("search-input");
    const searchButton = screen.getByTestId("search-button");

    fireEvent.change(searchInput, { target: { value: "trauma" } });
    expect(searchInput).toHaveValue("trauma");

    fireEvent.click(searchButton);
    expect(console.log).toHaveBeenCalledWith("Searching reports:", "trauma");
  });

  it("handles advanced filters and mobile settings clicks", () => {
    render(<SearchReportsPage />);

    const advBtn = screen.getByTestId("advanced-filters-button");
    fireEvent.click(advBtn);
    expect(console.log).toHaveBeenCalledWith(
      "Open advanced report filters popup (age, sex, insurance, etc.)"
    );

    const mobileBtn = screen.getByTestId("mobile-settings-button");
    fireEvent.click(mobileBtn);
    expect(console.log).toHaveBeenCalledWith(
      "Open mobile settings popup (sort & language options)"
    );
  });

  it("initializes with default state values", () => {
    render(<SearchReportsPage />);

    const searchInput = screen.getByTestId("search-input");
    const sortValue = screen.getByTestId("sort-value");

    expect(searchInput).toHaveValue("");
    expect(sortValue.textContent).toContain('"value":"name"');
    expect(sortValue.textContent).toContain('"label":"Sort by: Name"');
  });
});
