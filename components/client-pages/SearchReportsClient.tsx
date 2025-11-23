"use client";

import SearchPageHeader from "@/components/layout/SearchPageHeader";
import ReportCard from "@/components/cards/ReportCard";
import Pagination from "@/components/general/Pagination";
import Toast from "@/components/general/Toast";
import { useState, useTransition, useEffect, useRef } from "react";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import { translateText } from "@/lib/actions/translate";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select"; // Import this for handleSortChange

// Extract the type from fetchReports
type ReportsData = Awaited<ReturnType<typeof fetchReports>>["data"];
type Report = NonNullable<ReportsData>[number];

interface SelectOption {
  value: string;
  label: string;
}

interface SearchReportsClientProps {
  initialReports: Report[];
  totalPages: number;
  initialSearchTerm?: string;
  showSuccessToast?: boolean;
  showDeletedToast?: boolean;
  languageOptions: SelectOption[];
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
  languageOptions,
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

  const [selectedLanguage, setSelectedLanguage] = useState<{
    value: string;
    label: string;
  } | null>(() => {
    const langParam = searchParams.get("lang");
    if (langParam) {
      return languageOptions.find((opt) => opt.value === langParam) || null;
    }
    return null;
  });

  const [reports, setReports] = useState(initialReports);
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startFetchTransition] = useTransition();
  const [translatedReports, setTranslatedReports] =
    useState<Report[]>(initialReports);
  const [isTranslating, setIsTranslating] = useState(false);
  const shouldTranslateRef = useRef(false);

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

  // Update translated reports when reports change
  useEffect(() => {
    // If a language is selected and we should translate, re-translate
    if (selectedLanguage && shouldTranslateRef.current) {
      translateReports(selectedLanguage);
    } else {
      setTranslatedReports(reports);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

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

    // Update URL immediately with all parameters
    const params: { [key: string]: string | number } = { q: value, p: 1 };
    if (selectedLanguage) {
      params.lang = selectedLanguage.value;
    }
    if (sortOption) {
      params.sort = sortOption.value;
    }
    updateURLParams(params);

    const { column, ascending } = getSortParams(sortOption.value);

    startFetchTransition(async () => {
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
    const params: { [key: string]: string | number } = {
      sort: option.value,
      p: 1,
    };
    if (searchTerm) {
      params.q = searchTerm;
    }
    if (selectedLanguage) {
      params.lang = selectedLanguage.value;
    }
    updateURLParams(params); // Update URL

    const { column, ascending } = getSortParams(option.value);

    startFetchTransition(async () => {
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

  const translateReports = async (
    option: SelectOption,
    showLoading = false
  ) => {
    if (showLoading) {
      setIsTranslating(true);
    }

    try {
      // Translate all reports
      const translationPromises = reports.map(async (report) => {
        // If report's original language matches selected language, return original
        if (report.language.code === option.value) {
          return report;
        }

        // Otherwise, translate title and description
        try {
          const [translatedTitle, translatedDescription] = await Promise.all([
            translateText(report.title, option.value),
            translateText(report.description, option.value),
          ]);

          return {
            ...report,
            title: translatedTitle,
            description: translatedDescription,
          };
        } catch (error) {
          console.error(`Failed to translate report ${report.id}:`, error);
          // Return original if translation fails
          return report;
        }
      });

      const translated = await Promise.all(translationPromises);
      setTranslatedReports(translated);

      // Return success status
      return true;
    } catch (error) {
      console.error("Translation error:", error);
      if (showLoading) {
        setToastMessage("Translation failed. Please try again.");
        setToastType("error");
        setToastVisible(true);
      }
      // Reset to original on error
      setTranslatedReports(reports);
      return false;
    } finally {
      if (showLoading) {
        setIsTranslating(false);
      }
    }
  };

  const handleLanguageChange = async (option: SelectOption | null) => {
    setSelectedLanguage(option);

    // Update URL with language parameter
    const newParams = new URLSearchParams(searchParams.toString());
    if (option) {
      newParams.set("lang", option.value);
      shouldTranslateRef.current = true; // Enable translation for this language
    } else {
      newParams.delete("lang");
      shouldTranslateRef.current = false; // Disable translation
    }
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });

    if (!option) {
      // Reset to original content if no language selected
      setTranslatedReports(reports);
      setIsTranslating(false);
      return;
    }

    // Show loading and toast only on manual language selection
    const success = await translateReports(option, true);
    if (success) {
      setToastMessage("Translation successful!");
      setToastType("success");
      setToastVisible(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params: { [key: string]: string | number } = { p: page };
    if (searchTerm) {
      params.q = searchTerm;
    }
    if (sortOption) {
      params.sort = sortOption.value;
    }
    if (selectedLanguage) {
      params.lang = selectedLanguage.value;
    }
    updateURLParams(params); // Update URL
    const { column, ascending } = getSortParams(sortOption.value);

    startFetchTransition(async () => {
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
        languageValue={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        languageOptions={languageOptions}
        onAdvancedFiltersClick={() => {
          console.log("Open advanced report filters");
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup");
        }}
      />

      <div className="mt-6">
        {isTranslating && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-primary font-Noto-Sans text-sm font-medium">
              Translating reports...
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          {translatedReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {translatedReports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}

        {translatedReports.length > 0 && currentTotalPages > 1 && (
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
