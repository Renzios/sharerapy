"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select";

/* Components */
import SearchPageHeader from "@/components/layout/SearchPageHeader";
import PatientCard, { PatientCardData } from "@/components/cards/PatientCard";
import PatientCardSkeleton from "@/components/skeletons/PatientCardSkeleton";
import Pagination from "@/components/general/Pagination";
import Modal from "@/components/general/Modal";
import PatientFilters from "@/components/filters/PatientFilters";
import Toast from "@/components/general/Toast";

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setToastMessage("Patient deleted successfully.");
      setToastType("success");
      setToastVisible(true);

      // Remove the query param but keep others (like search/sort)
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("deleted");
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Conditional Rendering logic */}
          {isPending ? (
            // Show 12 Skeletons (4 columns x 3 rows looks good)
            Array.from({ length: 12 }).map((_, index) => (
              <PatientCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : initialPatients.length > 0 ? (
            // Show Data
            initialPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          ) : (
            // Empty State (Full Width)
            <div className="col-span-1 lg:col-span-4 text-center py-8">
              <p className="text-darkgray">No patients found</p>
            </div>
          )}
        </div>

        {/* Hide Pagination while loading or empty */}
        {!isPending && initialPatients.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
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
