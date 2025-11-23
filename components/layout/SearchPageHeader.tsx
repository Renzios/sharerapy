import Search from "@/components/general/Search";
import Button from "@/components/general/Button";
import Filter from "@mui/icons-material/Tune";
import Settings from "@mui/icons-material/Settings";
import Link from "next/link";
import React from "react";
import Select, { SingleValue } from "react-select";

/**
 * Option interface for React Select components
 */
interface SelectOption {
  /** The value of the option (used programmatically) */
  value: string;
  /** The display label of the option (shown to users) */
  label: string;
}

/**
 * Props interface for the SearchPageHeader component
 */
interface SearchPageHeaderProps {
  // Search functionality
  /** Current value of the search input */
  searchValue?: string;
  /** Callback fired when search input value changes */
  onSearchChange?: (value: string) => void;
  /** Callback fired when search is executed */
  onSearch?: (value: string) => void;

  // Navigation buttons (All, Patients, Reports, Therapist)
  /** Currently active page/tab for navigation highlighting */
  currentPage?: "all" | "patients" | "reports" | "therapists";
  /**
   * Whether to show the navigation buttons (All, Patients, etc.)
   * @default true
   */
  showNavButtons?: boolean;

  // Mobile advanced filters popup (age, sex, upload date, etc.)
  /** Callback fired when advanced filters button is clicked (mobile only) */
  onAdvancedFiltersClick?: () => void;
  /** Whether the advanced filters button is disabled */
  advancedFiltersDisabled?: boolean;

  // Mobile settings popup (contains sort/view options)
  /** Callback fired when mobile settings button is clicked (mobile only) */
  onMobileSettingsClick?: () => void;
  /** Whether the mobile settings button is disabled */
  mobileSettingsDisabled?: boolean;

  // Desktop sort/view selects (visible on desktop, hidden in mobile settings popup)
  /** Available sort options for the sort dropdown */
  sortOptions?: SelectOption[];
  /** Currently selected sort option */
  sortValue?: SelectOption;
  /** Callback fired when sort option changes */
  onSortChange?: (option: SingleValue<SelectOption>) => void;
  /** Whether the sort dropdown is disabled */
  sortDisabled?: boolean;

  // Language select (always present)
  /** Available language options for the language dropdown */
  languageOptions?: SelectOption[];
  /** Currently selected language option */
  languageValue?: SelectOption | null;
  /** Callback fired when language option changes */
  onLanguageChange?: (option: SingleValue<SelectOption>) => void;
  /** Whether the language dropdown is disabled */
  languageDisabled?: boolean;
}

/**
 * The SearchPageHeader component is the header for the search pages (all, patients, reports, therapists).
 * It contains the search bar, filter and display options, as well as navigation buttons.
 * The layout adapts responsively between mobile and desktop views.
 *
 * @param props - The search page header props
 */
export default function SearchPageHeader({
  searchValue = "",
  onSearchChange,
  onSearch,
  currentPage = "all",
  showNavButtons = true, // <-- Default value is set here
  onAdvancedFiltersClick,
  advancedFiltersDisabled = false,
  onMobileSettingsClick,
  mobileSettingsDisabled = false,
  sortOptions,
  sortValue,
  onSortChange,
  sortDisabled = false,
  languageOptions = [
    { value: "en", label: "English" },
    { value: "fl", label: "Filipino" },
  ],
  languageValue,
  onLanguageChange,
  languageDisabled = false,
}: SearchPageHeaderProps) {
  /**
   * Custom styling function for React Select components.
   * Provides consistent design that matches the application's design system.
   *
   * @param isDisabled - Whether the select should appear disabled
   * @returns Styling object for React Select components
   */
  const selectStyles = (isDisabled: boolean) => ({
    control: (base: object) => ({
      ...base,
      minWidth: "7rem",
      width: "100%",
      minHeight: "1.875rem",
      height: "1.875rem",
      fontFamily: "'Noto Sans', sans-serif",
      fontSize: "0.6875rem",
      backgroundColor: isDisabled ? "#f9fafb" : "white",
      border: `1px solid var(--border-bordergray, ${
        isDisabled ? "#d1d5db" : "#e5e7eb"
      })`,
      borderRadius: "0.5rem",
      boxShadow: "none",
      cursor: isDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        border: `1px solid var(--border-bordergray, ${
          isDisabled ? "#d1d5db" : "#e5e7eb"
        })`,
      },
    }),
    valueContainer: (base: object) => ({
      ...base,
      padding: "0 8px",
      fontFamily: "'Noto Sans', sans-serif",
    }),
    input: (base: object) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontFamily: "'Noto Sans', sans-serif",
    }),
    indicatorsContainer: (base: object) => ({
      ...base,
      height: "1.875rem",
    }),
    menu: (base: object) => ({
      ...base,
      zIndex: 9999,
      fontSize: "0.6875rem",
      fontFamily: "'Noto Sans', sans-serif",
      borderRadius: "0.5rem",
      border: "1px solid var(--border-bordergray, #e5e7eb)",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    menuList: (base: object) => ({
      ...base,
      padding: "4px",
      maxHeight: "200px",
      fontFamily: "'Noto Sans', sans-serif",
    }),
    option: (
      base: object,
      state: { isSelected: boolean; isFocused: boolean }
    ) => ({
      ...base,
      fontSize: "0.6875rem",
      fontFamily: "'Noto Sans', sans-serif",
      padding: "8px 12px",
      borderRadius: "0.25rem",
      backgroundColor: state.isSelected
        ? "var(--color-primary, #3b82f6)"
        : state.isFocused
        ? "var(--color-bordergray, #f3f4f6)"
        : "transparent",
      color: state.isSelected ? "white" : "var(--color-black, #000000)",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected
          ? "var(--color-primary, #3b82f6)"
          : "var(--color-bordergray, #e5e7eb)",
      },
    }),
  });

  return (
    <div className="flex flex-col items-center gap-y-3">
      <div className="h-1/3 w-full flex gap-2">
        <div className="flex-1 min-w-1 lg:w-full">
          <Search
            value={searchValue}
            onChange={onSearchChange}
            onSearch={onSearch}
          />
        </div>

        <button
          onClick={onAdvancedFiltersClick}
          disabled={advancedFiltersDisabled}
          className={`
            w-[2.5rem] h-[2.5rem] sm:w-[3rem] sm:h-[2.8125rem]
            bg-white border border-bordergray
            rounded-full
            flex items-center justify-center
            text-darkgray hover:bg-bordergray/30
            transition-colors duration-200
            flex-shrink-0
            lg:hidden
            ${advancedFiltersDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Filter />
        </button>

        <button
          onClick={onMobileSettingsClick}
          disabled={mobileSettingsDisabled}
          className={`
            w-[2.5rem] h-[2.5rem] sm:w-[3rem] sm:h-[2.8125rem]
            bg-white border border-bordergray
            rounded-full
            flex items-center justify-center
            text-darkgray hover:bg-bordergray/30
            transition-colors duration-200
            flex-shrink-0
            lg:hidden
            ${mobileSettingsDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Settings />
        </button>
      </div>

      <div className="h-1/2 w-full flex items-center gap-2 lg:gap-4 min-w-0 overflow-hidden">
        {/* --- Conditional Rendering Wrapper --- */}
        {showNavButtons && (
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            <Link
              href={`/search${
                searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""
              }`}
            >
              <Button
                variant={currentPage === "all" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                All
              </Button>
            </Link>

            <Link
              href={`/search/patients${
                searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""
              }`}
            >
              <Button
                variant={currentPage === "patients" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Patients
              </Button>
            </Link>

            <Link
              href={`/search/reports${
                searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""
              }`}
            >
              <Button
                variant={currentPage === "reports" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Reports
              </Button>
            </Link>

            <Link
              href={`/search/therapists${
                searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""
              }`}
            >
              <Button
                variant={currentPage === "therapists" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="flex-shrink min-w-0 whitespace-nowrap"
              >
                Therapist
              </Button>
            </Link>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1 lg:gap-2 min-w-0 flex-shrink ml-auto">
          {!sortDisabled && (
            <Select
              instanceId="sort-select"
              options={sortOptions}
              value={sortValue}
              onChange={onSortChange}
              isDisabled={sortDisabled}
              className="w-[7rem] lg:w-[8rem] xl:w-[10rem] 2xl:w-[11.875rem] min-w-[7rem] flex-shrink"
              classNamePrefix="react-select"
              styles={selectStyles(sortDisabled)}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
            />
          )}

          {!languageDisabled && (
            <Select
              instanceId="language-select"
              options={languageOptions}
              value={languageValue}
              onChange={onLanguageChange}
              isDisabled={languageDisabled}
              placeholder="Display Language"
              className="w-[7rem] lg:w-[8rem] xl:w-[10rem] 2xl:w-[11.875rem] min-w-[7rem] flex-shrink"
              classNamePrefix="react-select"
              styles={selectStyles(languageDisabled)}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
