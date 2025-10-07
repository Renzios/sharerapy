"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import ReportCard from "@/components/ReportCard";
import Pagination from "@/components/Pagination";
import { useState, useTransition } from "react";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";

// Extract the type from fetchReports
type ReportsData = Awaited<ReturnType<typeof fetchReports>>["data"];
type Report = NonNullable<ReportsData>[number];

interface SearchReportsClientProps {
  initialReports: Report[];
  totalPages: number;
}

/**
 * This is the client component for the Reports search page.
 * This is where the user interactivity happens (searching, sorting, pagination).
 * @param props - The initial reports and total pages from the server component
 */
export default function SearchReportsPage({
  initialReports,
  totalPages,
}: SearchReportsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState({
    value: "titleAscending",
    label: "Sort by: Title (A-Z)",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [reports, setReports] = useState(initialReports);
  const [currentPage, setCurrentPage] = useState(1); // Start at Page 1 (note: server uses 0-indexing)
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

  {
    /* Report Specific Sort Options */
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
        return { column: "title", ascending: true };
    }
  };

  const handleSortChange = (
    option: { value: string; label: string } | null
  ) => {
    if (!option) return;

    setSortOption(option);
    const { column, ascending } = getSortParams(option.value);

    startTransition(async () => {
      const result = await fetchReports({
        column,
        ascending,
        page: currentPage,
      });
      if (result.success && result.data) {
        setReports(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const { column, ascending } = getSortParams(sortOption.value);

    startTransition(async () => {
      const result = await fetchReports({
        column,
        ascending,
        page,
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
        onSearch={(value) => {
          console.log("Searching reports:", value);
          // Add your search logic here
        }}
        currentPage="reports"
        // Custom sort options for reports
        sortOptions={reportSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        // Language selector (uses component defaults)
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) {
            setLanguageOption(option);
          }
        }}
        onAdvancedFiltersClick={() => {
          console.log(
            "Open advanced report filters popup (age, sex, insurance, etc.)"
          );
          // This will open a popup with report-specific filters
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
          // This will open a popup with the sort/language options (same as desktop selects)
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:px-5">
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
    </div>
  );
}
