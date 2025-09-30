"use client";

import SearchPageHeader from "@/components/SearchPageHeader";
import ReportCard from "@/components/ReportCard";
import { useState } from "react";

/**
 * Search page that displays reports
 */
export default function SearchReportsPage() {
  const koreanDesc =
    "고요한 성찰의 공간에서, 사람들은 부드러운 안내를 받으며 자신의 생각과 감정을 탐색합니다. 상담 세션은 마음 챙김의 인식을 장려하며, 도전 과제를 처리하고 내면의 힘을 발견할 수 있는 안전한 환경을 제공합니다. 적극적인 경청과 공감적인 지원을 통해, 클라이언트는 대처 전략을 개발하고 회복력을 키우며 개인적 성장을 촉진합니다. 각 대화는 이해, 인정, 그리고 자기 역량 강화에 중점을 두어, 사람들이 스트레스, 불안, 삶의 전환을 명확하고 자신 있게 헤쳐 나갈 수 있도록 합니다. 발전은 신뢰, 개방성, 그리고 웰빙에 대한 헌신을 바탕으로 점진적으로 이루어집니다.";
  const englishDesc =
    "In the quiet space of reflection, individuals explore their thoughts and emotions with gentle guidance. Sessions encourage mindful awareness, providing a safe environment to process challenges and uncover inner strength. Through active listening and empathetic support, clients develop coping strategies, nurture resilience, and foster personal growth. Each conversation emphasizes understanding, validation, and empowerment, allowing individuals to navigate stress, anxiety, and life transitions with clarity and confidence. ";
  const frenchDesc =
    "Dans l’espace tranquille de la réflexion, les individus explorent leurs pensées et émotions avec une guidance douce. Les séances encouragent la pleine conscience, offrant un environnement sûr pour traiter les défis et découvrir la force intérieure. Grâce à l’écoute active et au soutien empathique, les clients développent des stratégies d’adaptation, nourrissent leur résilience et favorisent leur croissance personnelle. ";
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState({
    value: "name",
    label: "Sort by: Name",
  });
  const [languageOption, setLanguageOption] = useState({
    value: "en",
    label: "English",
  });

  // Report-specific sort options
  const reportSortOptions = [
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
          console.log("Searching reports:", value);
          // Add your search logic here
        }}
        currentPage="reports"
        // Custom sort options for reports
        sortOptions={reportSortOptions}
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
            "Open advanced report filters popup (age, sex, insurance, etc.)"
          );
          // This will open a popup with report-specific filters
        }}
        onMobileSettingsClick={() => {
          console.log("Open mobile settings popup (sort & language options)");
          // This will open a popup with the sort/language options (same as desktop selects)
        }}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:px-5">
          {Array.from({ length: 3 }, (_, index) => {
            const reports = [
              {
                title: "Anxiety assessment",
                description: englishDesc,
                dateUploaded: "November 22, 2025",
                country: "USA",
                language: "en",
                therapyType: "CBT",
                clinic: "Sunrise Clinic",
                therapistName: "Dr. Alice Wong",
                therapistPFP: undefined,
              },
              {
                title: "PTSD follow-up",
                description: koreanDesc,
                dateUploaded: "August 27, 2025",
                country: "Canada",
                language: "en",
                therapyType: "Trauma-focused",
                clinic: "Maple Health",
                therapistName: "Dr. Brian Lee",
                therapistPFP: undefined,
              },
              {
                title: "Couples therapy overview",
                description: frenchDesc,
                dateUploaded: "January 10, 2025",
                country: "UK",
                language: "en",
                therapyType: "Couples",
                clinic: "Riverdale Center",
                therapistName: "Dr. Clara Smith",
                therapistPFP: undefined,
              },
            ];

            const report = { ...reports[index % reports.length] };

            return <ReportCard key={`report-${index}`} report={report} />;
          })}
        </div>
      </div>
    </div>
  );
}
