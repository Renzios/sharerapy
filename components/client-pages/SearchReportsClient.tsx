"use client";

/* React Hooks & NextJS Utilities */
import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/* Components */
import SearchPageHeader from "@/components/layout/SearchPageHeader";
import ReportCard from "@/components/cards/ReportCard";
import Pagination from "@/components/general/Pagination";
import Toast from "@/components/general/Toast";

/* Types */
import { Tables } from "@/lib/types/database.types";
import { SingleValue } from "react-select";

type ReportWithRelations = Tables<"reports"> & {
  therapist: Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };
  type: Tables<"types">;
  language: Tables<"languages">;
  patient: Tables<"patients"> & {
    country: Tables<"countries"> | null;
    age?: string;
  };
};

interface SearchReportsClientProps {
  initialReports: ReportWithRelations[];
  totalPages: number;
  initialSearchTerm?: string;
  showSuccessToast?: boolean;
  showDeletedToast?: boolean;
  // Removed languageOptions from props
}

const reportSortOptions = [
  { value: "titleAscending", label: "Sort by: Title (A-Z)" },
  { value: "titleDescending", label: "Sort by: Title (Z-A)" },
  { value: "dateAscending", label: "Sort by: Date (Oldest First)" },
  { value: "dateDescending", label: "Sort by: Date (Newest First)" },
];

export default function SearchReportsPage({
  initialReports,
  totalPages,
  initialSearchTerm = "",
  showSuccessToast = false,
  showDeletedToast = false,
}: SearchReportsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const currentSortParam = searchParams.get("sort");
  const sortOption =
    reportSortOptions.find((o) => o.value === currentSortParam) ||
    reportSortOptions[3];

  const currentPage = Number(searchParams.get("p")) || 1;

  // Removed translatedReports state, isTranslating state, and language logic

  const [isPending, startFetchTransition] = useTransition();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const updateURLParams = useCallback(
    (changes: { [key: string]: string | number | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      startFetchTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Removed the translation useEffect entirely

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateURLParams({ q: value, p: 1 });
  };

  const handleSortChange = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    if (!option) return;
    updateURLParams({ sort: option.value, p: 1 });
  };

  // Removed handleLanguageChange

  const handlePageChange = (page: number) => {
    updateURLParams({ p: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toast Logic
  useEffect(() => {
    if (showSuccessToast) {
      setToastMessage("Report created successfully!");
      setToastType("success");
      setToastVisible(true);
      router.replace(pathname, { scroll: false });
    }
  }, [showSuccessToast, router, pathname]);

  useEffect(() => {
    if (showDeletedToast) {
      setToastMessage("Report deleted successfully!");
      setToastType("success");
      setToastVisible(true);
      router.replace(pathname, { scroll: false });
    }
  }, [showDeletedToast, router, pathname]);

  return (
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="reports"
        sortOptions={reportSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        onAdvancedFiltersClick={() =>
          console.log("Open advanced report filters")
        }
        ids={{
          searchInputId: "search-reports-input",
          mobileFiltersButtonId: "search-reports-mobile-filters-button",
          mobileSettingsButtonId: "search-reports-mobile-settings-button",
          searchAllButtonId: "search-reports-all-button",
          searchPatientsButtonId: "search-reports-patients-button",
          searchReportsButtonId: "search-reports-reports-button",
          searchTherapistsButtonId: "search-reports-therapists-button",
          sortSelectId: "search-reports-sort-select",
          languageSelectId: "search-reports-language-select",
        }}
      />

      <div className="mt-6">
        {/* Directly using initialReports now */}
        <div
          className={`grid grid-cols-1 gap-4 transition-opacity duration-200 ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {initialReports.map((report) => (
            <ReportCard
              id={`search-report-${report.id}`}
              key={report.id}
              report={report}
              disabled={isPending}
            />
          ))}
        </div>

        {initialReports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}

        {initialReports.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        )}
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
