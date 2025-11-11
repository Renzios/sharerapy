"use client";

import SearchPageHeader from "@/components/layout/SearchPageHeader";
import ReportCard from "@/components/cards/ReportCard";
import Pagination from "@/components/general/Pagination";
import Toast from "@/components/general/Toast";
import { useState, useTransition, useEffect } from "react";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select"; // Import this for handleSortChange

// Extract the type from fetchReports
type ReportsData = Awaited<ReturnType<typeof fetchReports>>["data"];
type Report = NonNullable<ReportsData>[number];

interface SearchReportsClientProps {
  initialReports: Report[];
  totalPages: number;
  initialSearchTerm?: string;
  showSuccessToast?: boolean;
  showDeletedToast?: boolean;
}
const reportSortOptions = [
  { value: "titleAscending", label: "Sort by: Title (A-Z)" },
  { value: "titleDescending", label: "Sort by: Title (Z-A)" },
  { value: "dateAscending", label: "Sort by: Date (Oldest First)" },
  { value: "dateDescending", label: "Sort by: Date (Newest First)" },
];

const getSortParams = (
  optionValue: string
): { column: "title" | "created_at"; ascending: boolean } => {
  switch (optionValue) {
    case "titleAscending":
      return { column: "title", ascending: true };
    case "titleDescending":
      return { column: "title", ascending: false };
    case "dateAscending":
      return { column: "created_at", ascending: true };
    case "dateDescending":
      return { column: "created_at", ascending: false };
    default:
      return { column: "created_at", ascending: false };
  }
};

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
  const [sortOption, setSortOption] = useState(() => {
    const sortParam = searchParams.get("sort");
    return (
      reportSortOptions.find((o) => o.value === sortParam) ||
      reportSortOptions[3]
    );
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams.get("p")) || 1;
  });

  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [reports, setReports] = useState(initialReports);
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

  // Toast State
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Show success toast on mount if needed, then clean URL
  useEffect(() => {
    if (showSuccessToast) {
      setToastMessage("Report created successfully!");
      setToastType("success");
      setToastVisible(true);
      // Clean the URL to remove the success parameter
      router.replace(pathname, { scroll: false }); // Use pathname
    }
  }, [showSuccessToast, router, pathname]);

  // Show success toast after report deletion
  useEffect(() => {
    if (showDeletedToast) {
      setToastMessage("Report deleted successfully!");
      setToastType("success");
      setToastVisible(true);
      router.replace(pathname, { scroll: false });
    }
  }, [showDeletedToast, router, pathname]);

  const updateURLParams = (params: { [key: string]: string | number }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      newParams.set(key, String(value));
    });
    // We use router.push to add to history, so "back" works
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURLParams({ q: value, p: 1 }); // Update URL

    const { column, ascending } = getSortParams(sortOption.value);

    startTransition(async () => {
      const result = await fetchReports({
        column,
        ascending,
        page: 1,
        search: value,
      });
      if (result.success && result.data) {
        setReports(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handleSortChange = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    if (!option) return;

    setSortOption(option);
    // Reset to page 1 when sort changes
    setCurrentPage(1);
    updateURLParams({ sort: option.value, p: 1 }); // Update URL

    const { column, ascending } = getSortParams(option.value);

    startTransition(async () => {
      const result = await fetchReports({
        column,
        ascending,
        page: 1, // Fetch page 1
        search: searchTerm,
      });
      if (result.success && result.data) {
        setReports(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLParams({ p: page }); // Update URL
    const { column, ascending } = getSortParams(sortOption.value);

    startTransition(async () => {
      const result = await fetchReports({
        column,
        ascending,
        page,
        search: searchTerm,
      });

      if (result.success && result.data) {
        setReports(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) {
            setLanguageOption(option);
          }
        }}
        onAdvancedFiltersClick={() => {
          console.log("Open advanced report filters");
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup");
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}

        {reports.length > 0 && currentTotalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={currentTotalPages}
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
