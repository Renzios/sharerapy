import Search from "@/components/Search";
import Button from "@/components/Button";
import Filter from "@mui/icons-material/Tune";
import Settings from "@mui/icons-material/Settings";
import Link from "next/link";
import React from "react";
import Select, { SingleValue } from "react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SearchPageHeaderProps {
  // Search functionality
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;

  // Navigation buttons (All, Patients, Reports, Therapist)
  currentPage?: "all" | "patients" | "reports" | "therapists";

  // Mobile advanced filters popup (age, sex, upload date, etc.)
  onAdvancedFiltersClick?: () => void;
  advancedFiltersDisabled?: boolean;

  // Mobile settings popup (contains sort/view options)
  onMobileSettingsClick?: () => void;
  mobileSettingsDisabled?: boolean;

  // Desktop sort/view selects (visible on desktop, hidden in mobile settings popup)
  sortOptions?: SelectOption[];
  sortValue?: SelectOption;
  onSortChange?: (option: SingleValue<SelectOption>) => void;
  sortDisabled?: boolean;

  // Language select (always present)
  languageOptions?: SelectOption[];
  languageValue?: SelectOption;
  onLanguageChange?: (option: SingleValue<SelectOption>) => void;
  languageDisabled?: boolean;
}

export default function SearchPageHeader({
  searchValue = "",
  onSearchChange,
  onSearch,
  currentPage = "all",
  onAdvancedFiltersClick,
  advancedFiltersDisabled = false,
  onMobileSettingsClick,
  mobileSettingsDisabled = false,

  // Sort select config
  sortOptions = [
    { value: "newest", label: "Sort by: Newest" },
    { value: "oldest", label: "Sort by: Oldest" },
    { value: "name", label: "Sort by: Name" },
    { value: "relevance", label: "Sort by: Relevance" },
  ],
  sortValue = { value: "newest", label: "Sort by: Newest" },
  onSortChange,
  sortDisabled = false,

  // Language select config
  languageOptions = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "zh", label: "中文" },
  ],
  languageValue = { value: "en", label: "English" },
  onLanguageChange,
  languageDisabled = false,
}: SearchPageHeaderProps) {
  const selectStyles = (isDisabled: boolean) => ({
    control: (base: any) => ({
      ...base,
      minWidth: "7rem",
      width: "100%",
      minHeight: "1.875rem",
      height: "1.875rem",
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
    valueContainer: (base: any) => ({
      ...base,
      padding: "0 8px",
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: "1.875rem",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
      fontSize: "0.6875rem",
      borderRadius: "0.5rem",
      border: "1px solid var(--border-bordergray, #e5e7eb)",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    menuList: (base: any) => ({
      ...base,
      padding: "4px",
      maxHeight: "200px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: "0.6875rem",
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
      <div className="h-1/3 w-full flex gap-2 lg:px-4">
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

      <div className="h-1/2 w-full flex items-center gap-2 lg:gap-4 lg:px-4 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          <Link href="/search">
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

          <Link href="/search/patients">
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

          <Link href="/search/reports">
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

          <Link href="/search/therapists">
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

        <div className="hidden lg:flex items-center gap-1 lg:gap-2 min-w-0 flex-shrink ml-auto">
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

          <Select
            instanceId="language-select"
            options={languageOptions}
            value={languageValue}
            onChange={onLanguageChange}
            isDisabled={languageDisabled}
            className="w-[7rem] lg:w-[8rem] xl:w-[10rem] 2xl:w-[11.875rem] min-w-[7rem] flex-shrink"
            classNamePrefix="react-select"
            styles={selectStyles(languageDisabled)}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
          />
        </div>
      </div>
    </div>
  );
}
