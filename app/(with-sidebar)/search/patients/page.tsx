"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import { useState } from "react";

/**
 * Search page that displays patients
 */
export default function SearchPatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState({
    value: "name",
    label: "Sort by: Name",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  // Patient-specific sort options
  const patientSortOptions = [
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
          console.log("Searching patients:", value);
          // Add your search logic here
        }}
        currentPage="patients"
        // Custom sort options for patients
        sortOptions={patientSortOptions}
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
            "Open advanced patient filters popup (age, sex, insurance, etc.)"
          );
          // This will open a popup with patient-specific filters
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
          // This will open a popup with the sort/language options (same as desktop selects)
        }}
      />

      <div className="mt-6">{/* patients search results will go here */}</div>
    </div>
  );
}
