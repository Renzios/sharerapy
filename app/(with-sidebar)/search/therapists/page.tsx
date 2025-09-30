"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import TherapistCard from "@/components/TherapistCard";
import { useState } from "react";

/**
 * Search page that displays therapists
 */
export default function SearchTherapistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState({
    value: "name",
    label: "Sort by: Name",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  // Therapist-specific sort options
  const therapistSortOptions = [
    { value: "name", label: "Sort by: Name" },
    { value: "age", label: "Sort by: Age" },
    { value: "recent_visit", label: "Sort by: Recent Visit" },
    { value: "condition", label: "Sort by: Condition" },
    { value: "therapist", label: "Sort by: Therapist" },
    { value: "newest", label: "Sort by: Date Added" },
  ];

  return (
    <div>
      <SearchPageHeader
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={(value) => {
          console.log("Searching therapists:", value);
          // Add your search logic here
        }}
        currentPage="therapists"
        // Custom sort options for therapists
        sortOptions={therapistSortOptions}
        sortValue={sortOption}
        onSortChange={(option) => {
          if (option) {
            setSortOption(option);
          }
        }}
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
          {Array.from({ length: 20 }, (_, index) => {
            const therapists = [
              {
                id: 1,
                name: "Dr. Jane Smith",
                clinic: "Sunrise Clinic",
                pictureUrl: "/testpfp.jpg",
              },
              {
                id: 2,
                name: "Dr. John Doe",
                clinic: "Wellness Center",
                pictureUrl: "/testpfp.jpg",
              },
              {
                id: 3,
                name: "Dr. Emily Lee",
                clinic: "Harmony Health",
                pictureUrl: "/testpfp.jpg",
              },
              {
                id: 4,
                name: "Dr. Michael Chan",
                clinic: "Mindful Therapy",
                pictureUrl: "/testpfp.jpg",
              },
            ];

            const therapist = therapists[index % 4];
            return (
              <TherapistCard
                key={`therapist-${index}`}
                therapist={{
                  ...therapist,
                  id: index + 1,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
