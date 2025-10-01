"use client";

import { useState } from "react";
import SearchPageHeader from "@/components/SearchPageHeader";
import PatientCard from "@/components/PatientCard";
import ReportCard from "@/components/ReportCard";
import TherapistCard from "@/components/TherapistCard";

/**
 * Search page that displays all (patients, reports, therapists)
 */
export default function SearchPage() {
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
          console.log("Searching patients:", value);
          // Add your search logic here
        }}
        currentPage="patients"
        // Remove sort options since sorting is disabled
        sortOptions={undefined}
        sortValue={undefined}
        onSortChange={undefined}
        sortDisabled={true} // Disable the first individual react select
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
        advancedFiltersDisabled={true} // Disable mobile filters
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
          // This will open a popup with the sort/language options (same as desktop selects)
        }}
      />

      <div className="mt-6 flex flex-col gap-4">
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Patients
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:px-5">
          <PatientCard
            patient={{
              id: 1,
              name: "John Doe",
              contactNumber: "123-456-7890",
              country: "USA",
              sex: "Male",
            }}
          />
          <PatientCard
            patient={{
              id: 2,
              name: "Jane Smith",
              contactNumber: "987-654-3210",
              country: "Canada",
              sex: "Female",
            }}
          />
          <PatientCard
            patient={{
              id: 3,
              name: "Alice Brown",
              contactNumber: "555-123-4567",
              country: "UK",
              sex: "Female",
            }}
          />
          <PatientCard
            patient={{
              id: 4,
              name: "Bob Johnson",
              contactNumber: "444-987-6543",
              country: "Australia",
              sex: "Male",
            }}
          />
        </div>

        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Reports
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:px-5">
          <ReportCard
            report={{
              title: "Therapy Session Report",
              description:
                "Detailed analysis of the therapy session conducted on 2025-09-30. Detailed analysis of the therapy session conducted on 2025-09-30. Detailed analysis of the therapy session conducted on 2025-09-30. Detailed analysis of the therapy session conducted on 2025-09-30.",
              dateUploaded: "2025-09-30",
              country: "USA",
              language: "English",
              therapyType: "Cognitive Behavioral Therapy",
              clinic: "Wellness Clinic",
              therapistName: "Dr. John Doe",
              therapistPFP: null,
            }}
          />
          <ReportCard
            report={{
              title: "Progress Evaluation",
              description:
                "Evaluation of the patient's progress over the last three months.",
              dateUploaded: "2025-09-15",
              country: "Canada",
              language: "English",
              therapyType: "Behavioral Therapy",
              clinic: "Health First Clinic",
              therapistName: "Dr. Jane Smith",
              therapistPFP: null,
            }}
          />
        </div>

        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray px-5">
          Therapists
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5 lg:px-5">
          <TherapistCard
            therapist={{
              id: 1,
              name: "Dr. Alice Green",
              clinic: "Mindful Therapy Center",
              pictureUrl: "/testpfp.jpg",
              email: "alice.green@example.com",
              country: "USA",
            }}
          />
          <TherapistCard
            therapist={{
              id: 2,
              name: "Dr. Bob White",
              clinic: "Harmony Clinic",
              pictureUrl: "/testpfp.jpg",
              email: "bob.white@example.com",
              country: "Canada",
            }}
          />
          <TherapistCard
            therapist={{
              id: 3,
              name: "Dr. Carol Blue",
              clinic: "Wellness First",
              pictureUrl: "/testpfp.jpg",
              email: "carol.blue@example.com",
              country: "UK",
            }}
          />
          <TherapistCard
            therapist={{
              id: 4,
              name: "Dr. David Black",
              clinic: "Therapy Solutions",
              pictureUrl: "/testpfp.jpg",
              email: "david.black@example.com",
              country: "Australia",
            }}
          />
          <div className="flex justify-center col-span-2 lg:col-span-1 lg:block">
            <TherapistCard
              therapist={{
                id: 5,
                name: "Dr. Eve Brown",
                clinic: "Care & Cure",
                pictureUrl: "/testpfp.jpg",
                email: "eve.brown@example.com",
                country: "Germany",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
