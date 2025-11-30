"use client";

import SearchPageHeader from "@/components/layout/SearchPageHeader";
import PatientCard from "@/components/cards/PatientCard";
import Pagination from "@/components/general/Pagination";
import { useState, useTransition } from "react";
import { fetchPatients } from "@/app/(with-sidebar)/search/patients/actions";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select";

// Extract the type from what fetchPatients returns
type PatientsData = Awaited<ReturnType<typeof fetchPatients>>["data"];
type Patient = NonNullable<PatientsData>[number];

interface SearchPatientsClientProps {
  initialPatients: Patient[];
  totalPages: number;
  initialSearchTerm?: string;
}

const patientSortOptions = [
  { value: "nameAscending", label: "Sort by: Name (A-Z)" },
  { value: "nameDescending", label: "Sort by: Name (Z-A)" },
];

export default function SearchPatientsClient({
  initialPatients,
  totalPages,
  initialSearchTerm = "",
}: SearchPatientsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOption, setSortOption] = useState(() => {
    const sortParam = searchParams.get("sort");
    return (
      patientSortOptions.find((o) => o.value === sortParam) ||
      patientSortOptions[0]
    );
  });
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams.get("p")) || 1;
  });

  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [patients, setPatients] = useState(initialPatients);
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
    updateURLParams({ q: value, p: 1 });

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
    option: SingleValue<{ value: string; label: string }>
  ) => {
    if (!option) return;

    setSortOption(option);
    setCurrentPage(1); // Reset to page 1
    updateURLParams({ sort: option.value, p: 1 });

    const isAscending = option.value === "nameAscending";

    startTransition(async () => {
      const result = await fetchPatients({
        search: searchTerm,
        ascending: isAscending,
        page: 1, // Fetch page 1
      });
      if (result.success && result.data) {
        setPatients(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLParams({ p: page });

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
          console.log("Open advanced patient filters popup");
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup");
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
