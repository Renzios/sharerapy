"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SingleValue } from "react-select";
import { Tables } from "@/lib/types/database.types";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import PatientProfile from "../layout/PatientProfile";
import SearchPageHeader from "../layout/SearchPageHeader";
import ReportCard from "@/components/cards/ReportCard";
import Pagination from "@/components/general/Pagination";

type ReportWithRelations = Tables<"reports"> & {
  therapist: Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };
  type: Tables<"types">;
  language: Tables<"languages">;
};

type PatientWithRelations = Tables<"patients"> & {
  age?: string;
  country: Tables<"countries">;
  reports: ReportWithRelations[];
};

interface PatientProfileClientProps {
  patient: PatientWithRelations;
  initialReports: ReportWithRelations[];
  totalPages: number;
  initialSearchTerm?: string;
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

export default function PatientProfileClient({
  patient,
  initialReports,
  totalPages,
  initialSearchTerm = "",
}: PatientProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOption, setSortOption] = useState(reportSortOptions[3]); // newest first default
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [reports, setReports] = useState(initialReports);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("p");
    return pageParam ? Number(pageParam) : 1;
  });
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

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
    const { column, ascending } = getSortParams(sortOption.value);
    updateURLParams({ q: value, p: 1 });

    startTransition(async () => {
      const result = await fetchReports({
        patientID: patient.id,
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
    const { column, ascending } = getSortParams(option.value);

    startTransition(async () => {
      const result = await fetchReports({
        patientID: patient.id,
        column,
        ascending,
        page: currentPage,
        search: searchTerm,
      });
      if (result.success && result.data) {
        setReports(result.data as ReportWithRelations[]);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const { column, ascending } = getSortParams(sortOption.value);
    updateURLParams({ p: page });

    startTransition(async () => {
      const result = await fetchReports({
        patientID: patient.id,
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
      <PatientProfile patient={patient} />
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="reports"
        showNavButtons={false}
        sortOptions={reportSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) setLanguageOption(option);
        }}
      />

      <div
        className={`flex flex-col gap-4 ${
          isPending ? "opacity-60 transition-opacity" : ""
        }`}
      >
        {reports.length > 0 ? (
          reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}
      </div>

      {reports.length > 0 && currentTotalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={currentTotalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      )}
    </div>
  );
}
