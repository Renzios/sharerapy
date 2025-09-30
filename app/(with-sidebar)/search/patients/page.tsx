"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import PatientCard from "@/components/PatientCard";
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

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:px-5">
          {Array.from({ length: 20 }, (_, index) => {
            const patients = [
              {
                id: 1,
                name: "John Doe",
                contactNumber: "+1234567890",
                country: "USA",
                sex: "Male",
              },
              {
                id: 2,
                name: "Jane Smith",
                contactNumber: "+0987654321",
                country: "Canada",
                sex: "Female",
              },
              {
                id: 3,
                name: "Mike Wilson",
                contactNumber: "+1122334455",
                country: "UK",
                sex: "Male",
              },
              {
                id: 4,
                name: "Sarah Davis",
                contactNumber: "+5566778899",
                country: "Australia",
                sex: "Female",
              },
            ];

            const patient = patients[index % 4];
            return (
              <PatientCard
                key={`patient-${index}`}
                patient={{
                  ...patient,
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
