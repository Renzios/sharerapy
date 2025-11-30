"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SingleValue } from "react-select";
import { Tables } from "@/lib/types/database.types";
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
  const [isPending, startTransition] = useTransition();

  // Derived state from URL
  const currentSortParam = searchParams.get("sort");
  const sortOption =
    reportSortOptions.find((o) => o.value === currentSortParam) ||
    reportSortOptions[3];

  const currentPage = Number(searchParams.get("p")) || 1;

  // URL Update Helper
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

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

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

  const handlePageChange = (page: number) => {
    updateURLParams({ p: page });
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
      />

      <div className="flex flex-col gap-4">
        <div
          className={`flex flex-col gap-4 transition-opacity duration-200 ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {initialReports.length > 0 ? (
            initialReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                disabled={isPending}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-darkgray">No reports found</p>
            </div>
          )}
        </div>
      </div>

      {initialReports.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      )}
    </div>
  );
}
