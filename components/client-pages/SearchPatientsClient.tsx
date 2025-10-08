"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import PatientCard from "@/components/cards/PatientCard";
import Pagination from "@/components/Pagination";
import { useState, useTransition } from "react";
import { fetchPatients } from "@/app/(with-sidebar)/search/patients/actions";

// Extract the type from what fetchPatients returns
type PatientsData = Awaited<ReturnType<typeof fetchPatients>>["data"];
type Patient = NonNullable<PatientsData>[number];

interface SearchPatientsClientProps {
  initialPatients: Patient[];
  totalPages: number;
  initialSearchTerm?: string;
}

/**
 * This is the client component for the Patients search page.
 * This is where the user interactivity happens (searching, sorting, pagination).
 * @param props - The initial patients and total pages from the server component
 */
export default function SearchPatientsClient({
  initialPatients,
  totalPages,
  initialSearchTerm = "",
}: SearchPatientsClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  {
    /* Default Values for Sort and Language Select */
  }
  const [sortOption, setSortOption] = useState({
    value: "nameAscending",
    label: "Sort by: Name (A-Z)",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [patients, setPatients] = useState(initialPatients);
  const [currentPage, setCurrentPage] = useState(1); // Start at Page 1 (note: server uses 0-indexing)
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

  {
    /* Patient Specific Sort Options */
  }
  const patientSortOptions = [
    { value: "nameAscending", label: "Sort by: Name (A-Z)" },
    { value: "nameDescending", label: "Sort by: Name (Z-A)" },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    startTransition(async () => {
      const result = await fetchPatients({
        search: value,
        ascending: sortOption.value === "nameAscending",
        page: 1,
      });

      if (result.success && result.data) {
        setPatients(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handleSortChange = (
    option: { value: string; label: string } | null
  ) => {
    if (!option) return;

    setSortOption(option);
    const isAscending = option.value === "nameAscending";

    startTransition(async () => {
      const result = await fetchPatients({
        search: searchTerm,
        ascending: isAscending,
        page: currentPage,
      });
      if (result.success && result.data) {
        setPatients(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    startTransition(async () => {
      const result = await fetchPatients({
        search: searchTerm,
        ascending: sortOption.value === "nameAscending",
        page,
      });

      if (result.success && result.data) {
        setPatients(result.data);
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
        currentPage="patients"
        sortOptions={patientSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) {
            setLanguageOption(option);
          }
        }}
        onAdvancedFiltersClick={() => {
          console.log(
            "Open advanced patient filters popup (age, sex, insurance, etc.)"
          );
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:px-5">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        {patients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No patients found</p>
          </div>
        )}

        {patients.length > 0 && currentTotalPages > 1 && (
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
