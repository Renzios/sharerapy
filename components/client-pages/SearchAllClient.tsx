"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/* Components */
import SearchPageHeader from "@/components/layout/SearchPageHeader";
import PatientCard, { PatientCardData } from "@/components/cards/PatientCard";
import ReportCard from "@/components/cards/ReportCard";
import TherapistCard, {
  TherapistCardData,
} from "@/components/cards/TherapistCard";

// Using the tables type for ReportCard until/unless ReportCard exports a specific type
import { Tables } from "@/lib/types/database.types";
type Report = Tables<"reports"> & {
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

interface SearchAllClientProps {
  initialPatients: PatientCardData[];
  initialReports: Report[];
  initialTherapists: TherapistCardData[];
  initialSearchTerm?: string;
}

/**
 * This is the client component for the main Search page.
 * It displays a fixed number of patients (4), reports (2), and therapists (5).
 * No pagination, sorting, or advanced filters on this page.
 */
export default function SearchAllClient({
  initialPatients,
  initialReports,
  initialTherapists,
  initialSearchTerm = "",
}: SearchAllClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isPending, startTransition] = useTransition();

  const disabledSortOption = [
    {
      value: "disabled",
      label: "Sort by: Disabled",
    },
  ];

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
    updateURLParams({ q: value });
  };

  return (
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="all"
        sortOptions={disabledSortOption}
        sortValue={disabledSortOption[0]}
        sortDisabled={true}
        onAdvancedFiltersClick={() => {
          console.log("Filters disabled on main search page");
        }}
        advancedFiltersDisabled={true}
      />

      <div
        className={`mt-6 flex flex-col gap-4 transition-opacity duration-200 ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Patients Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray">
          Patients
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {initialPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        {initialPatients.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No patients found</p>
          </div>
        )}

        {/* Reports Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray">
          Reports
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {initialReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {initialReports.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}

        {/* Therapists Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray">
          Therapists
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5">
          {initialTherapists.map((therapist, index) =>
            index === 4 ? (
              <div
                key={therapist.id}
                className="col-span-2 flex justify-center lg:col-span-1 lg:block"
              >
                <TherapistCard therapist={therapist} />
              </div>
            ) : (
              <TherapistCard key={therapist.id} therapist={therapist} />
            )
          )}
        </div>

        {initialTherapists.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No therapists found</p>
          </div>
        )}
      </div>
    </div>
  );
}
