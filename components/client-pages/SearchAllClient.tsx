"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import PatientCard from "@/components/cards/PatientCard";
import ReportCard from "@/components/cards/ReportCard";
import TherapistCard from "@/components/cards/TherapistCard";
import { useState, useTransition } from "react";
import { fetchPatients } from "@/app/(with-sidebar)/search/patients/actions";
import { fetchReports } from "@/app/(with-sidebar)/search/reports/actions";
import { fetchTherapists } from "@/app/(with-sidebar)/search/therapists/actions";

// Extract types from the fetch functions
type PatientsData = Awaited<ReturnType<typeof fetchPatients>>["data"];
type Patient = NonNullable<PatientsData>[number];

type ReportsData = Awaited<ReturnType<typeof fetchReports>>["data"];
type Report = NonNullable<ReportsData>[number];

type TherapistsData = Awaited<ReturnType<typeof fetchTherapists>>["data"];
type Therapist = NonNullable<TherapistsData>[number];

interface SearchAllClientProps {
  initialPatients: Patient[];
  initialReports: Report[];
  initialTherapists: Therapist[];
  initialSearchTerm?: string;
}

/**
 * This is the client component for the main Search page.
 * It displays a fixed number of patients (4), reports (2), and therapists (5).
 * No pagination, sorting, or advanced filters on this page.
 * @param props - The initial data from the server component
 */
export default function SearchAllClient({
  initialPatients,
  initialReports,
  initialTherapists,
  initialSearchTerm = "",
}: SearchAllClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [patients, setPatients] = useState(initialPatients);
  const [reports, setReports] = useState(initialReports);
  const [therapists, setTherapists] = useState(initialTherapists);
  const [isPending, startTransition] = useTransition();

  const disabledSortOption = [
    {
      value: "disabled",
      label: "Sort by: Disabled",
    },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    startTransition(async () => {
      // Fetch from all three resources in parallel
      const [patientsResult, reportsResult, therapistsResult] =
        await Promise.all([
          fetchPatients({ search: value, page: 1 }),
          fetchReports({ search: value, page: 1 }),
          fetchTherapists({ search: value, page: 1 }),
        ]);

      // Limit to specific counts: 4 patients, 2 reports, 5 therapists
      if (patientsResult.success)
        setPatients((patientsResult.data || []).slice(0, 4));
      if (reportsResult.success)
        setReports((reportsResult.data || []).slice(0, 2));
      if (therapistsResult.success)
        setTherapists((therapistsResult.data || []).slice(0, 5));
    });
  };

  return (
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="all"
        // Remove sort options since sorting is disabled
        sortOptions={disabledSortOption}
        sortValue={disabledSortOption[0]}
        onSortChange={undefined}
        sortDisabled={true}
        // Language selector (uses component defaults)
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) {
            setLanguageOption(option);
          }
        }}
        onAdvancedFiltersClick={() => {
          console.log("Filters disabled on main search page");
        }}
        advancedFiltersDisabled={true}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (language option only)");
        }}
      />

      <div className="mt-6 flex flex-col gap-4">
        {/* Patients Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Patients
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:px-5">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        {patients.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No patients found</p>
          </div>
        )}

        {/* Reports Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Reports
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:px-5">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No reports found</p>
          </div>
        )}

        {/* Therapists Section */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Therapists
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5 lg:px-5">
          {therapists.map((therapist, index) =>
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

        {therapists.length === 0 && (
          <div className="text-center py-4">
            <p className="text-darkgray">No therapists found</p>
          </div>
        )}
      </div>
    </div>
  );
}
