import { render, screen, fireEvent } from '@testing-library/react';
import SearchPageHeader from '@/components/SearchPageHeader';

// Mock interfaces
interface MockSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

interface MockButtonProps {
  children: React.ReactNode;
  variant?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

interface MockLinkProps {
  children: React.ReactNode;
  href?: string;
  [key: string]: unknown;
}

interface SelectOption {
  value: string;
  label: string;
}

interface MockSelectProps {
  options?: SelectOption[];
  value?: SelectOption;
  onChange?: (option: SelectOption | null) => void;
  instanceId?: string;
  isDisabled?: boolean;
  [key: string]: unknown;
}

// Mock the components
jest.mock('@/components/Search', () => {
  return function MockSearch({ value, onChange, onSearch }: MockSearchProps) {
    return (
      <div data-testid="mock-search">
        <input
          data-testid="search-input"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.(value || '')}
        />
        <button onClick={() => onSearch?.(value || '')}>Search</button>
      </div>
    );
  };
});

jest.mock('@/components/Button', () => {
  return function MockButton({ children, variant, onClick, ...props }: MockButtonProps) {
    return (
      <button
        data-testid={`mock-button-${String(children).toLowerCase()}`}
        data-variant={variant}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  };
});

// Mock MUI Icons
jest.mock('@mui/icons-material/Tune', () => {
  return function MockTuneIcon() {
    return <svg data-testid="tune-icon" />;
  };
});

jest.mock('@mui/icons-material/Settings', () => {
  return function MockSettingsIcon() {
    return <svg data-testid="settings-icon" />;
  };
});

// Mock Next Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: MockLinkProps) {
    return <div data-testid={`link-${href}`} {...props}>{children}</div>;
  };
});

// Mock React Select
jest.mock('react-select', () => {
  return function MockSelect({ options, value, onChange, instanceId, isDisabled, ...props }: MockSelectProps) {
    return (
      <select
        data-testid={`mock-select-${instanceId}`}
        value={value?.value || ''}
        onChange={(e) => {
          const selectedOption = options?.find((opt: SelectOption) => opt.value === e.target.value);
          onChange?.(selectedOption || null);
        }}
        disabled={isDisabled}
        {...props}
      >
        {options?.map((option: SelectOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
});

describe('SearchPageHeader Component', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnAdvancedFilters = jest.fn();
  const mockOnMobileSettings = jest.fn();
  const mockOnSortChange = jest.fn();
  const mockOnLanguageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SearchPageHeader />);
    
    expect(screen.getByTestId('mock-search')).toBeInTheDocument();
  });

  it('displays search component with correct props', () => {
    render(
      <SearchPageHeader
        searchValue="test search"
        onSearchChange={mockOnSearchChange}
        onSearch={mockOnSearch}
      />
    );
    
    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveValue('test search');
    
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  it('renders navigation buttons with correct variants', () => {
    render(<SearchPageHeader currentPage="patients" />);
    
    const allButton = screen.getByTestId('mock-button-all');
    const patientsButton = screen.getByTestId('mock-button-patients');
    const reportsButton = screen.getByTestId('mock-button-reports');
    const therapistButton = screen.getByTestId('mock-button-therapist');
    
    expect(allButton).toHaveAttribute('data-variant', 'outline');
    expect(patientsButton).toHaveAttribute('data-variant', 'filled');
    expect(reportsButton).toHaveAttribute('data-variant', 'outline');
    expect(therapistButton).toHaveAttribute('data-variant', 'outline');
  });

  it('renders navigation buttons wrapped in correct links', () => {
    render(<SearchPageHeader />);
    
    expect(screen.getByTestId('link-/search')).toBeInTheDocument();
    expect(screen.getByTestId('link-/search/patients')).toBeInTheDocument();
    expect(screen.getByTestId('link-/search/reports')).toBeInTheDocument();
    expect(screen.getByTestId('link-/search/therapists')).toBeInTheDocument();
  });

  it('displays mobile filter and settings buttons', () => {
    render(
      <SearchPageHeader
        onAdvancedFiltersClick={mockOnAdvancedFilters}
        onMobileSettingsClick={mockOnMobileSettings}
      />
    );
    
    const filterIcon = screen.getByTestId('tune-icon');
    const settingsIcon = screen.getByTestId('settings-icon');
    
    expect(filterIcon).toBeInTheDocument();
    expect(settingsIcon).toBeInTheDocument();
    
    // Test button clicks
    const filterButton = filterIcon.closest('button');
    const settingsButton = settingsIcon.closest('button');
    
    fireEvent.click(filterButton!);
    expect(mockOnAdvancedFilters).toHaveBeenCalledTimes(1);
    
    fireEvent.click(settingsButton!);
    expect(mockOnMobileSettings).toHaveBeenCalledTimes(1);
  });

  it('disables mobile buttons when specified', () => {
    render(
      <SearchPageHeader
        advancedFiltersDisabled={true}
        mobileSettingsDisabled={true}
      />
    );
    
    const filterButton = screen.getByTestId('tune-icon').closest('button');
    const settingsButton = screen.getByTestId('settings-icon').closest('button');
    
    expect(filterButton).toBeDisabled();
    expect(settingsButton).toBeDisabled();
  });

  it('renders desktop select dropdowns', () => {
    const customSortOptions = [
      { value: 'name', label: 'Sort by: Name' },
      { value: 'date', label: 'Sort by: Date' }
    ];
    
    const customLanguageOptions = [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' }
    ];

    render(
      <SearchPageHeader
        sortOptions={customSortOptions}
        sortValue={{ value: 'name', label: 'Sort by: Name' }}
        onSortChange={mockOnSortChange}
        languageOptions={customLanguageOptions}
        languageValue={{ value: 'en', label: 'English' }}
        onLanguageChange={mockOnLanguageChange}
      />
    );
    
    const sortSelect = screen.getByTestId('mock-select-sort-select');
    const languageSelect = screen.getByTestId('mock-select-language-select');
    
    expect(sortSelect).toBeInTheDocument();
    expect(languageSelect).toBeInTheDocument();
    
    // Test sort select change
    fireEvent.change(sortSelect, { target: { value: 'date' } });
    expect(mockOnSortChange).toHaveBeenCalledWith({ value: 'date', label: 'Sort by: Date' });
    
    // Test language select change
    fireEvent.change(languageSelect, { target: { value: 'es' } });
    expect(mockOnLanguageChange).toHaveBeenCalledWith({ value: 'es', label: 'Español' });
  });

  it('disables select dropdowns when specified', () => {
    render(
      <SearchPageHeader
        sortDisabled={true}
        languageDisabled={true}
      />
    );
    
    const sortSelect = screen.getByTestId('mock-select-sort-select');
    const languageSelect = screen.getByTestId('mock-select-language-select');
    
    expect(sortSelect).toBeDisabled();
    expect(languageSelect).toBeDisabled();
  });

  it('uses default options when not provided', () => {
    render(<SearchPageHeader />);
    
    const sortSelect = screen.getByTestId('mock-select-sort-select');
    const languageSelect = screen.getByTestId('mock-select-language-select');
    
    // Should render with default options
    expect(sortSelect).toBeInTheDocument();
    expect(languageSelect).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    render(
      <SearchPageHeader
        searchValue="test"
        onSearch={mockOnSearch}
      />
    );
    
    const searchInput = screen.getByTestId('search-input');
    
    // Test Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(mockOnSearch).toHaveBeenCalledWith('test');
    
    // Test search button click
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    expect(mockOnSearch).toHaveBeenCalledWith('test');
  });
});