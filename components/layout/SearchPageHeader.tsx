import Search from "@/components/general/Search";
import Button from "@/components/general/Button";
import Filter from "@mui/icons-material/Tune";
import Link from "next/link";
import Select, { SingleValue } from "react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SearchPageHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  currentPage?: "all" | "patients" | "reports" | "therapists";
  showNavButtons?: boolean;
  onAdvancedFiltersClick?: () => void;
  advancedFiltersDisabled?: boolean;
  sortOptions?: SelectOption[];
  sortValue?: SelectOption;
  onSortChange?: (option: SingleValue<SelectOption>) => void;
  sortDisabled?: boolean;
  ids?: {
    searchInputId?: string;
    mobileFiltersButtonId?: string;
    mobileSettingsButtonId?: string;
    searchAllButtonId?: string;
    searchPatientsButtonId?: string;
    searchReportsButtonId?: string;
    searchTherapistsButtonId?: string;
    sortSelectId?: string;
    languageSelectId?: string;
  };
}

export default function SearchPageHeader({
  searchValue = "",
  onSearchChange,
  onSearch,
  currentPage = "all",
  showNavButtons = true,
  onAdvancedFiltersClick,
  advancedFiltersDisabled = false,
  sortOptions,
  sortValue,
  onSortChange,
  sortDisabled = false,
  ids,
}: SearchPageHeaderProps) {
  const selectStyles = (isDisabled: boolean) => ({
    control: (base: object) => ({
      ...base,
      minWidth: "7rem",
      width: "100%",
      minHeight: "1.875rem", // Matching this height
      height: "1.875rem",
      fontFamily: "'Noto Sans', sans-serif",
      fontSize: "0.6875rem", // Matching this font size
      backgroundColor: isDisabled ? "#f9fafb" : "white",
      border: `1px solid var(--border-bordergray, ${
        isDisabled ? "#d1d5db" : "#e5e7eb"
      })`,
      borderRadius: "0.5rem", // Matching this radius
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
            id={ids?.searchInputId}
            value={searchValue}
            onChange={onSearchChange}
            onSearch={onSearch}
          />
        </div>

        {/* Mobile Filter Button */}
        <button
          id={ids?.mobileFiltersButtonId}
          onClick={onAdvancedFiltersClick}
          disabled={advancedFiltersDisabled}
          className={`
            w-10 h-10 sm:w-12 sm:h-11.25
            bg-white border border-bordergray
            rounded-full
            flex items-center justify-center
            text-darkgray hover:bg-bordergray/30
            transition-colors duration-200
            shrink-0
            lg:hidden
            ${advancedFiltersDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <Filter />
        </button>
      </div>

      <div className="h-1/2 w-full flex items-center gap-2 lg:gap-4 min-w-0 overflow-hidden">
        {showNavButtons && (
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <Link
              href={`/search${
                searchValue ? `?q=${encodeURIComponent(searchValue)}` : ""
              }`}
            >
              <Button
                id={ids?.searchAllButtonId}
                variant={currentPage === "all" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="shrink min-w-0 whitespace-nowrap"
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
                id={ids?.searchPatientsButtonId}
                variant={currentPage === "patients" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="shrink min-w-0 whitespace-nowrap"
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
                id={ids?.searchReportsButtonId}
                variant={currentPage === "reports" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="shrink min-w-0 whitespace-nowrap"
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
                id={ids?.searchTherapistsButtonId}
                variant={currentPage === "therapists" ? "filled" : "outline"}
                fontSize="text-[0.6875rem]"
                shape="pill"
                width="auto"
                height="1.875rem"
                className="shrink min-w-0 whitespace-nowrap"
              >
                Therapist
              </Button>
            </Link>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-1 lg:gap-2 min-w-0 shrink ml-auto">
          <Button
            variant="outline"
            height="1.875rem"
            fontSize="text-[0.6875rem]"
            onClick={onAdvancedFiltersClick}
            disabled={advancedFiltersDisabled}
            className={`
               w-28 lg:w-32 xl:w-40 2xl:w-47.5 min-w-28 shrink
               border-bordergray
               flex items-center justify-between px-2
               ${advancedFiltersDisabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span>Filters</span>
          </Button>

          {!sortDisabled && (
            <Select
              id={ids?.sortSelectId}
              instanceId={ids?.sortSelectId ?? ""}
              options={sortOptions}
              value={sortValue}
              onChange={onSortChange}
              isDisabled={sortDisabled}
              className="w-28 lg:w-32 xl:w-40 2xl:w-47.5 min-w-28 shrink"
              classNamePrefix="react-select"
              styles={selectStyles(sortDisabled)}
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
