"use client";

import SearchPageHeader from "@/components/layout/SearchPageHeader";
import TherapistCard from "@/components/cards/TherapistCard";
import Pagination from "@/components/general/Pagination";
import { useState, useTransition } from "react";
import { fetchTherapists } from "@/app/(with-sidebar)/search/therapists/actions";

// Extract the type from fetchTherapists
type TherapistsData = Awaited<ReturnType<typeof fetchTherapists>>["data"];
type Therapist = NonNullable<TherapistsData>[number];

interface SearchTherapistClientProps {
  initialTherapists: Therapist[];
  totalPages: number;
  initialSearchTerm?: string;
}

/**
 * This is the client component for the Therapists search page.
 * This is where the user interactivity happens (searching, sorting, pagination).
 * @param props - The initial therapists and total pages from the server component
 */
export default function SearchTherapistsPage({
  initialTherapists,
  totalPages,
  initialSearchTerm = "",
}: SearchTherapistClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const [sortOption, setSortOption] = useState({
    value: "nameAscending",
    label: "Sort by: Name (A-Z)",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  const [therapists, setTherapists] = useState(initialTherapists);
  const [currentPage, setCurrentPage] = useState(1); // Start at Page 1 (note: server uses 0-indexing)
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);
  const [isPending, startTransition] = useTransition();

  {
    /* Therapist Specific Sort Options */
  }
  const therapistSortOptions = [
    { value: "nameAscending", label: "Sort by: Name (A-Z)" },
    { value: "nameDescending", label: "Sort by: Name (Z-A)" },
  ];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);

    startTransition(async () => {
      const result = await fetchTherapists({
        search: value,
        ascending: sortOption.value === "nameAscending",
        page: 1,
      });
      if (result.success && result.data) {
        setTherapists(result.data);
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
      const result = await fetchTherapists({
        search: searchTerm,
        ascending: isAscending,
        page: currentPage,
      });
      if (result.success && result.data) {
        setTherapists(result.data);
        setCurrentTotalPages(result.totalPages);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    startTransition(async () => {
      const result = await fetchTherapists({
        search: searchTerm,
        ascending: sortOption.value === "nameAscending",
        page,
      });

      if (result.success && result.data) {
        setTherapists(result.data);
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
        currentPage="therapists"
        // Custom sort options for therapists
        sortOptions={therapistSortOptions}
        sortValue={sortOption}
        onSortChange={handleSortChange}
        // Language selector (uses component defaults)
        languageValue={languageOption}
        onLanguageChange={(option) => {
          if (option) {
            setLanguageOption(option);
          }
        }}
        onAdvancedFiltersClick={() => {
          console.log(
            "Open advanced therapist filters popup (age, sex, insurance, etc.)"
          );
          // This will open a popup with therapist-specific filters
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
          // This will open a popup with the sort/language options (same as desktop selects)
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5 lg:px-5">
          {therapists.map((therapist) => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>

        {therapists.length === 0 && (
          <div className="text-center py-8">
            <p className="text-darkgray">No therapists found</p>
          </div>
        )}

        {therapists.length > 0 && currentTotalPages > 1 && (
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
