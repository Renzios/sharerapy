"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SingleValue } from "react-select";
import { Tables } from "@/lib/types/database.types";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import { translateText } from "@/lib/actions/translate";
import { useTherapistProfile } from "@/app/hooks/useTherapistProfile";
import TherapistProfile from "../layout/TherapistProfile";
import SearchPageHeader from "../layout/SearchPageHeader";
import ReportCard from "@/components/cards/ReportCard";
import Pagination from "@/components/general/Pagination";
import Toast from "@/components/general/Toast";

type TherapistRelation = Tables<"therapists"> & {
  clinic: Tables<"clinics"> & {
    country: Tables<"countries">;
  };
};

type PatientWithCountry = Tables<"patients"> & {
  age?: string;
  country: Tables<"countries">;
};

type ReportWithRelations = Tables<"reports"> & {
  therapist: Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };
  type: Tables<"types">;
  language: Tables<"languages">;
  patient: PatientWithCountry;
};

type BasicReport = Omit<ReportWithRelations, "therapist">;

export type TherapistProfile = TherapistRelation & {
  reports: BasicReport[];
};

interface SelectOption {
  value: string;
  label: string;
}

interface TherapistProfileClientProps {
  therapist: TherapistProfile;
  initialReports: ReportWithRelations[];
  totalPages: number;
  initialSearchTerm?: string;
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

export default function TherapistProfileClient({
  therapist,
  initialReports,
  totalPages,
  initialSearchTerm,
  languageOptions,
}: TherapistProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current logged-in therapist to check if this is their own profile
  const { therapist: currentTherapist } = useTherapistProfile();
  const isOwnProfile = currentTherapist?.id === therapist.id;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOption, setSortOption] = useState(() => {
    const sortParam = searchParams.get("sort");
    return (
      reportSortOptions.find((o) => o.value === sortParam) ||
      reportSortOptions[3]
    );
  });
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption | null>(
    () => {
      const langParam = searchParams.get("lang");
      if (langParam) {
        return languageOptions.find((opt) => opt.value === langParam) || null;
      }
      return null;
    }
  );

  const [reports, setReports] = useState(initialReports);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("p");
    return pageParam ? Number(pageParam) : 1;
  });
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();
  const [translatedReports, setTranslatedReports] =
    useState<ReportWithRelations[]>(initialReports);
  const [isTranslating, setIsTranslating] = useState(false);
  const shouldTranslateRef = useRef(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Update translated reports when reports change
  useEffect(() => {
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
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    const params: { [key: string]: string | number } = { q: value, p: 1 };
    if (selectedLanguage) {
      params.lang = selectedLanguage.value;
    }
    if (sortOption) {
      params.sort = sortOption.value;
    }
    updateURLParams(params);

    const { column, ascending } = getSortParams(sortOption.value);

    startTransition(async () => {
      const result = await fetchReports({
        therapistID: therapist.id,
        column,
        ascending,
        page: 1,
        search: value,
      });
      if (result.success && result.data) {
        setReports(result.data as ReportWithRelations[]);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handleSortChange = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    if (!option) return;

    setSortOption(option);
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
    updateURLParams(params);

    const { column, ascending } = getSortParams(option.value);

    startTransition(async () => {
      const result = await fetchReports({
        therapistID: therapist.id,
        column,
        ascending,
        page: 1,
        search: searchTerm,
      });
      if (result.success && result.data) {
        setReports(result.data as ReportWithRelations[]);
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
      const translationPromises = reports.map(async (report) => {
        if (report.language.code === option.value) {
          return report;
        }

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
          return report;
        }
      });

      const translated = await Promise.all(translationPromises);
      setTranslatedReports(translated);
      return true;
    } catch (error) {
      console.error("Translation error:", error);
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

    const newParams = new URLSearchParams(searchParams.toString());
    if (option) {
      newParams.set("lang", option.value);
      shouldTranslateRef.current = true;
    } else {
      newParams.delete("lang");
      shouldTranslateRef.current = false;
    }
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });

    if (!option) {
      setTranslatedReports(reports);
      setIsTranslating(false);
      return;
    }

    const success = await translateReports(option, true);
    if (success) {
      setToastMessage("Translation successful!");
      setToastType("success");
      setToastVisible(true);
    } else {
      setToastMessage("Translation failed. Please try again.");
      setToastType("error");
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
    updateURLParams(params);

    const { column, ascending } = getSortParams(sortOption.value);

    startTransition(async () => {
      const result = await fetchReports({
        therapistID: therapist.id,
        column,
        ascending,
        page,
        search: searchTerm,
      });

      if (result.success && result.data) {
        setReports(result.data as ReportWithRelations[]);
        setCurrentTotalPages(result.totalPages);
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-y-8">
      <TherapistProfile therapist={therapist} />
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="reports"
        showNavButtons={false}
        sortOptions={reportSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        languageValue={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        languageOptions={languageOptions}
      />

      <div className="flex flex-col gap-4">
        {translatedReports.length > 0 ? (
          translatedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              showActions={isOwnProfile}
              disabled={isPending || isTranslating}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}
      </div>

      {translatedReports.length > 0 && currentTotalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={currentTotalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
