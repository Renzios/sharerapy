"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select";

/* Components */
import SearchPageHeader from "@/components/layout/SearchPageHeader";
import PatientCard, { PatientCardData } from "@/components/cards/PatientCard";
import Pagination from "@/components/general/Pagination";
import Modal from "@/components/general/Modal";
import PatientFilters from "@/components/filters/PatientFilters";

interface Option {
  value: string;
  label: string;
}

interface SearchPatientsClientProps {
  initialPatients: PatientCardData[];
  totalPages: number;
  initialSearchTerm?: string;
  countryOptions: Option[];
}

const patientSortOptions = [
  { value: "nameAscending", label: "Sort by: Name (A-Z)" },
  { value: "nameDescending", label: "Sort by: Name (Z-A)" },
];

export default function SearchPatientsClient({
  initialPatients,
  totalPages,
  initialSearchTerm = "",
  countryOptions,
}: SearchPatientsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isPending, startTransition] = useTransition();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const currentSortParam = searchParams.get("sort");
  const sortOption =
    patientSortOptions.find((o) => o.value === currentSortParam) ||
    patientSortOptions[0];

  const currentPage = Number(searchParams.get("p")) || 1;

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
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        currentPage="patients"
        sortOptions={patientSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        onAdvancedFiltersClick={() => setIsFilterModalOpen(true)}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Patients"
      >
        <PatientFilters
          countryOptions={countryOptions}
          onClose={() => setIsFilterModalOpen(false)}
          onUpdateParams={updateURLParams}
        />
      </Modal>

      <div className="mt-6">
        <div
          className={`grid grid-cols-1 gap-4 lg:grid-cols-4 transition-opacity duration-200 ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {initialPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        {initialPatients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No patients found</p>
          </div>
        )}

        {initialPatients.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}
