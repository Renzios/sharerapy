"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import PatientCard from "@/components/PatientCard";
import ReportCard from "@/components/ReportCard";
import TherapistCard from "@/components/TherapistCard";
import { useState } from "react";
import { readPatients } from "@/lib/data/patients";
import { readReports } from "@/lib/data/reports";
import { readTherapists } from "@/lib/data/therapists";

// Extract types from the read functions
type PatientsData = Awaited<ReturnType<typeof readPatients>>["data"];
type Patient = NonNullable<PatientsData>[number];

type ReportsData = Awaited<ReturnType<typeof readReports>>["data"];
type Report = NonNullable<ReportsData>[number];

type TherapistsData = Awaited<ReturnType<typeof readTherapists>>["data"];
type Therapist = NonNullable<TherapistsData>[number];

interface SearchAllClientProps {
  initialPatients: Patient[];
  initialReports: Report[];
  initialTherapists: Therapist[];
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
}: SearchAllClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  return (
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={(value) => {
          console.log("Searching all:", value);
          // Add your search logic here
        }}
        currentPage="all"
        // Remove sort options since sorting is disabled
        sortOptions={undefined}
        sortValue={undefined}
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
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Reports
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:px-5">
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
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Therapists
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5 lg:px-5">
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
