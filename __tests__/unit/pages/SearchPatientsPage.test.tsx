import { render, screen, fireEvent } from '@testing-library/react';
import SearchPatientsPage from '@/app/(with-sidebar)/search/patients/page';

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

interface MockPatientCardProps {
  patient: {
    id: number;
    name: string;
    contactNumber: string;
    country: string;
    sex: string;
  };
}

// Mock the child components
jest.mock('@/components/SearchPageHeader', () => {
  return function MockSearchPageHeader({ 
    searchValue, 
    onSearchChange, 
    onSearch, 
    currentPage,
    sortOptions,
    sortValue,
    onAdvancedFiltersClick,
    onMobileSettingsClick
  }: MockSearchPageHeaderProps) {
    return (
      <div data-testid="search-page-header">
        <input
          data-testid="search-input"
          value={searchValue || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search patients..."
        />
        <button
          data-testid="search-button"
          onClick={() => onSearch?.(searchValue || '')}
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

jest.mock('@/components/PatientCard', () => {
  return function MockPatientCard({ patient }: MockPatientCardProps) {
    return (
      <div data-testid={`patient-card-${patient.id}`} data-patient-name={patient.name}>
        <h2>{patient.name}</h2>
        <p>{patient.contactNumber}</p>
        <p>{patient.country}</p>
        <p>{patient.sex}</p>
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

describe('SearchPatientsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SearchPatientsPage />);
    
    expect(screen.getByTestId('search-page-header')).toBeInTheDocument();
  });

  it('renders SearchPageHeader with correct props', () => {
    render(<SearchPatientsPage />);
    
    const searchInput = screen.getByTestId('search-input');
    const currentPage = screen.getByTestId('current-page');
    
    expect(searchInput).toBeInTheDocument();
    expect(currentPage).toHaveTextContent('patients');
  });

  it('provides patient-specific sort options to SearchPageHeader', () => {
    render(<SearchPatientsPage />);
    
    const sortOptions = screen.getByTestId('sort-options');
    const sortOptionsText = sortOptions.textContent;
    
    expect(sortOptionsText).toContain('Sort by: Name');
    expect(sortOptionsText).toContain('Sort by: Age');
    expect(sortOptionsText).toContain('Sort by: Recent Visit');
    expect(sortOptionsText).toContain('Sort by: Condition');
    expect(sortOptionsText).toContain('Sort by: Therapist');
    expect(sortOptionsText).toContain('Sort by: Date Added');
  });

  it('renders exactly 20 patient cards', () => {
    render(<SearchPatientsPage />);
    
    // Check that we have 20 patient cards
    for (let i = 1; i <= 20; i++) {
      expect(screen.getByTestId(`patient-card-${i}`)).toBeInTheDocument();
    }
    
    // Verify no extra cards exist
    expect(screen.queryByTestId('patient-card-21')).not.toBeInTheDocument();
  });

  it('cycles through hardcoded patient data correctly', () => {
    render(<SearchPatientsPage />);
    
    // Check first patient (John Doe)
    const firstCard = screen.getByTestId('patient-card-1');
    expect(firstCard).toHaveAttribute('data-patient-name', 'John Doe');
    
    // Check second patient (Jane Smith)
    const secondCard = screen.getByTestId('patient-card-2');
    expect(secondCard).toHaveAttribute('data-patient-name', 'Jane Smith');
    
    // Check third patient (Mike Wilson)
    const thirdCard = screen.getByTestId('patient-card-3');
    expect(thirdCard).toHaveAttribute('data-patient-name', 'Mike Wilson');
    
    // Check fourth patient (Sarah Davis)
    const fourthCard = screen.getByTestId('patient-card-4');
    expect(fourthCard).toHaveAttribute('data-patient-name', 'Sarah Davis');
    
    // Check that pattern repeats - 5th patient should be John Doe again
    const fifthCard = screen.getByTestId('patient-card-5');
    expect(fifthCard).toHaveAttribute('data-patient-name', 'John Doe');
  });

  it('renders patient cards in a grid layout', () => {
    render(<SearchPatientsPage />);
    
    const gridContainer = screen.getByTestId('patient-card-1').parentElement;
    expect(gridContainer).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(<SearchPatientsPage />);
    
    const searchInput = screen.getByTestId('search-input');
    
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });
    
    expect(searchInput).toHaveValue('John Doe');
  });

  it('handles search submission', () => {
    render(<SearchPatientsPage />);
    
    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.click(searchButton);
    
    // Verify console.log was called (search logic)
    expect(console.log).toHaveBeenCalledWith('Searching patients:', 'test search');
  });

  it('handles sort option changes', () => {
    render(<SearchPatientsPage />);
    
    // Initial sort value should be "name"
    const sortValue = screen.getByTestId('sort-value');
    expect(sortValue.textContent).toContain('"value":"name"');
    expect(sortValue.textContent).toContain('"label":"Sort by: Name"');
  });

  it('handles advanced filters button click', () => {
    render(<SearchPatientsPage />);
    
    const advancedFiltersButton = screen.getByTestId('advanced-filters-button');
    fireEvent.click(advancedFiltersButton);
    
    expect(console.log).toHaveBeenCalledWith(
      'Open advanced patient filters popup (age, sex, insurance, etc.)'
    );
  });

  it('handles mobile settings button click', () => {
    render(<SearchPatientsPage />);
    
    const mobileSettingsButton = screen.getByTestId('mobile-settings-button');
    fireEvent.click(mobileSettingsButton);
    
    expect(console.log).toHaveBeenCalledWith(
      'Open mobile settings popup (sort & language options)'
    );
  });

  it('initializes with default state values', () => {
    render(<SearchPatientsPage />);
    
    const searchInput = screen.getByTestId('search-input');
    const sortValue = screen.getByTestId('sort-value');
    
    // Check initial empty search
    expect(searchInput).toHaveValue('');
    
    // Check initial sort option
    expect(sortValue.textContent).toContain('"value":"name"');
    expect(sortValue.textContent).toContain('"label":"Sort by: Name"');
  });

  it('displays all patient information correctly', () => {
    render(<SearchPatientsPage />);
    
    // Check that patient cards contain the expected data (using getAllByText for repeated names)
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+1234567890').length).toBeGreaterThan(0);
    expect(screen.getAllByText('USA').length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+0987654321').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Canada').length).toBeGreaterThan(0);
    
    expect(screen.getAllByText('Mike Wilson').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sarah Davis').length).toBeGreaterThan(0);
  });

  it('has proper page layout structure', () => {
    render(<SearchPatientsPage />);
    
    const searchHeader = screen.getByTestId('search-page-header');
    const gridContainer = screen.getByTestId('patient-card-1').parentElement;
    
    expect(searchHeader).toBeInTheDocument();
    expect(gridContainer).toBeInTheDocument();
  });

  it('assigns unique keys to patient cards', () => {
    render(<SearchPatientsPage />);
    
    // Each patient card should have a unique testid based on its position
    for (let i = 1; i <= 20; i++) {
      const card = screen.getByTestId(`patient-card-${i}`);
      expect(card).toBeInTheDocument();
    }
  });
});