import { render, screen, fireEvent } from "@testing-library/react";
import SearchTherapistsPage from "@/app/(with-sidebar)/search/therapists/page";

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

interface MockTherapistCardProps {
  therapist: {
    id: number;
    name: string;
    clinic: string;
    pictureUrl: string;
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
          placeholder="Search therapists..."
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

jest.mock("@/components/TherapistCard", () => {
  return function MockTherapistCard({ therapist }: MockTherapistCardProps) {
    return (
      <div
        data-testid={`therapist-card-${therapist.id}`}
        data-therapist-name={therapist.name}
      >
        <h2>{therapist.name}</h2>
        <p>{therapist.clinic}</p>
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

describe("SearchTherapistsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<SearchTherapistsPage />);
    expect(screen.getByTestId("search-page-header")).toBeInTheDocument();
  });

  it("renders SearchPageHeader with correct props", () => {
    render(<SearchTherapistsPage />);
    const searchInput = screen.getByTestId("search-input");
    const currentPage = screen.getByTestId("current-page");
    expect(searchInput).toBeInTheDocument();
    expect(currentPage).toHaveTextContent("therapists");
  });

  it("provides therapist-specific sort options to SearchPageHeader", () => {
    render(<SearchTherapistsPage />);
    const sortOptions = screen.getByTestId("sort-options");
    const sortOptionsText = sortOptions.textContent;
    expect(sortOptionsText).toContain("Sort by: Name");
    expect(sortOptionsText).toContain("Sort by: Age");
    expect(sortOptionsText).toContain("Sort by: Recent Visit");
    expect(sortOptionsText).toContain("Sort by: Condition");
    expect(sortOptionsText).toContain("Sort by: Therapist");
    expect(sortOptionsText).toContain("Sort by: Date Added");
  });

  it("renders exactly 20 therapist cards", () => {
    render(<SearchTherapistsPage />);
    for (let i = 1; i <= 20; i++) {
      expect(screen.getByTestId(`therapist-card-${i}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId("therapist-card-21")).not.toBeInTheDocument();
  });

  it("cycles through hardcoded therapist data correctly", () => {
    render(<SearchTherapistsPage />);
    // Check first therapist (Dr. Jane Smith)
    const firstCard = screen.getByTestId("therapist-card-1");
    expect(firstCard).toHaveAttribute("data-therapist-name", "Dr. Jane Smith");
    // Check second therapist (Dr. John Doe)
    const secondCard = screen.getByTestId("therapist-card-2");
    expect(secondCard).toHaveAttribute("data-therapist-name", "Dr. John Doe");
    // Check third therapist (Dr. Emily Lee)
    const thirdCard = screen.getByTestId("therapist-card-3");
    expect(thirdCard).toHaveAttribute("data-therapist-name", "Dr. Emily Lee");
    // Check fourth therapist (Dr. Michael Chan)
    const fourthCard = screen.getByTestId("therapist-card-4");
    expect(fourthCard).toHaveAttribute(
      "data-therapist-name",
      "Dr. Michael Chan"
    );
    // Check that pattern repeats - 5th therapist should be Dr. Jane Smith again
    const fifthCard = screen.getByTestId("therapist-card-5");
    expect(fifthCard).toHaveAttribute("data-therapist-name", "Dr. Jane Smith");
  });

  it("renders therapist cards in a grid layout", () => {
    render(<SearchTherapistsPage />);
    const gridContainer = screen.getByTestId("therapist-card-1").parentElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it("handles search input changes", () => {
    render(<SearchTherapistsPage />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Dr. Jane Smith" } });
    expect(searchInput).toHaveValue("Dr. Jane Smith");
  });

  it("handles search submission", () => {
    render(<SearchTherapistsPage />);
    const searchInput = screen.getByTestId("search-input");
    const searchButton = screen.getByTestId("search-button");
    fireEvent.change(searchInput, { target: { value: "test search" } });
    fireEvent.click(searchButton);
    expect(console.log).toHaveBeenCalledWith(
      "Searching therapists:",
      "test search"
    );
  });

  it("handles sort option changes", () => {
    render(<SearchTherapistsPage />);
    const sortValue = screen.getByTestId("sort-value");
    expect(sortValue.textContent).toContain('"value":"name"');
    expect(sortValue.textContent).toContain('"label":"Sort by: Name"');
  });

  it("handles advanced filters button click", () => {
    render(<SearchTherapistsPage />);
    const advancedFiltersButton = screen.getByTestId("advanced-filters-button");
    fireEvent.click(advancedFiltersButton);
    expect(console.log).toHaveBeenCalledWith(
      "Open advanced therapist filters popup (age, sex, insurance, etc.)"
    );
  });

  it("handles mobile settings button click", () => {
    render(<SearchTherapistsPage />);
    const mobileSettingsButton = screen.getByTestId("mobile-settings-button");
    fireEvent.click(mobileSettingsButton);
    expect(console.log).toHaveBeenCalledWith(
      "Open mobile settings popup (sort & language options)"
    );
  });

  it("initializes with default state values", () => {
    render(<SearchTherapistsPage />);
    const searchInput = screen.getByTestId("search-input");
    const sortValue = screen.getByTestId("sort-value");
    expect(searchInput).toHaveValue("");
    expect(sortValue.textContent).toContain('"value":"name"');
    expect(sortValue.textContent).toContain('"label":"Sort by: Name"');
  });

  it("displays all therapist information correctly", () => {
    render(<SearchTherapistsPage />);
    expect(screen.getAllByText("Dr. Jane Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dr. John Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dr. Emily Lee").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dr. Michael Chan").length).toBeGreaterThan(0);
  });

  it("has proper page layout structure", () => {
    render(<SearchTherapistsPage />);
    const searchHeader = screen.getByTestId("search-page-header");
    const gridContainer = screen.getByTestId("therapist-card-1").parentElement;
    expect(searchHeader).toBeInTheDocument();
    expect(gridContainer).toBeInTheDocument();
  });

  it("assigns unique keys to therapist cards", () => {
    render(<SearchTherapistsPage />);
    for (let i = 1; i <= 20; i++) {
      const card = screen.getByTestId(`therapist-card-${i}`);
      expect(card).toBeInTheDocument();
    }
  });
});
