"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SingleValue } from "react-select";

/* Components */
import SearchPageHeader from "@/components/layout/SearchPageHeader";
import TherapistCard, {
  TherapistCardData,
} from "@/components/cards/TherapistCard";
import TherapistCardSkeleton from "@/components/skeletons/TherapistCardSkeleton";
import Pagination from "@/components/general/Pagination";
import Modal from "@/components/general/Modal";
import TherapistFilters from "@/components/filters/TherapistFilters";

interface Option {
  value: string;
  label: string;
}

interface SearchTherapistClientProps {
  initialTherapists: TherapistCardData[];
  totalPages: number;
  initialSearchTerm?: string;
  clinicOptions: Option[];
  countryOptions: Option[];
}

const therapistSortOptions = [
  { value: "nameAscending", label: "Sort by: Name (A-Z)" },
  { value: "nameDescending", label: "Sort by: Name (Z-A)" },
];

export default function SearchTherapistClient({
  initialTherapists,
  totalPages,
  initialSearchTerm = "",
  clinicOptions,
  countryOptions,
}: SearchTherapistClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isPending, startTransition] = useTransition();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const currentSortParam = searchParams.get("sort");
  const sortOption =
    therapistSortOptions.find((o) => o.value === currentSortParam) ||
    therapistSortOptions[0];

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
        currentPage="therapists"
        sortOptions={therapistSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        onAdvancedFiltersClick={() => setIsFilterModalOpen(true)}
      />

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Therapists"
      >
        <TherapistFilters
          clinicOptions={clinicOptions}
          countryOptions={countryOptions}
          onClose={() => setIsFilterModalOpen(false)}
          onUpdateParams={updateURLParams}
        />
      </Modal>

      <div className="mt-6">
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5">
          {/* Conditional Loading Logic */}
          {isPending ? (
            // Show 15 skeletons (3 rows of 5 on desktop)
            Array.from({ length: 15 }).map((_, index) => (
              <TherapistCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : initialTherapists.length > 0 ? (
            // Show Data
            initialTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))
          ) : (
            // Empty State
            <div className="col-span-2 lg:col-span-5 text-center py-8">
              <p className="text-darkgray">No therapists found</p>
            </div>
          )}
        </div>

        {!isPending && initialTherapists.length > 0 && totalPages > 1 && (
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
