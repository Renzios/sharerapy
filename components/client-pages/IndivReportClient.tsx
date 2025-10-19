"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/general/Button";
import Select from "@/components/general/Select";
import { Tables } from "@/lib/types/database.types";
import PDFViewer from "@/components/blocknote/PDFViewer";

// Type for the report with nested relationships based on readReport query
type ReportWithRelations = Tables<"reports"> & {
  therapist: Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };
  type: Tables<"types">;
  language: Tables<"languages">;
  patient: Tables<"patients"> & {
    country: Tables<"countries"> | null;
    age?: string;
  };
};

interface IndivReportClientProps {
  report: ReportWithRelations;
}

/**
 * This is the client component for viewing an individual report.
 * It displays report metadata, therapist/patient cards, description, and PDF viewer.
 * Handles navigation back to reports search and language selection.
 * @param props - The report data from the server component
 */
export default function IndivReportClient({ report }: IndivReportClientProps) {
  const router = useRouter();

  // Navigation state to disable button during transition
  const [isNavigating, setIsNavigating] = useState(false);

  // Language selection state (placeholder for future translation feature)
  const [selectedLanguage, setSelectedLanguage] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "tagalog", label: "Tagalog" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBackClick = () => {
    setIsNavigating(true);

    if (
      document.referrer &&
      document.referrer.startsWith(window.location.origin)
    ) {
      router.back();
    } else {
      router.push("/search/reports");
    }
  };

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center">
          <h1 className="font-Noto-Sans text-xl md:text-3xl text-black font-semibold">
            {report.title}
          </h1>
          <Button
            variant="filled"
            className="ml-auto w-auto text-xs md:text-base md:w-24"
            onClick={handleBackClick}
            disabled={isNavigating}
          >
            Back
          </Button>
        </div>
        <p className="font-Noto-Sans text-[0.6875rem] md:text-sm font-medium text-darkgray ml-0.5">
          {formatDate(report.created_at)} |{" "}
          {report.therapist.clinic.country.country} | {report.language.language}{" "}
          | {report.type.type}
        </p>
      </div>

      <div className="max-w-md">
        <Select
          label="Display Language"
          options={languageOptions}
          value={selectedLanguage}
          onChange={setSelectedLanguage}
          placeholder="Select language..."
          instanceId="display-language-select"
        />
      </div>

      {/* Therapist and Patient Info Cards */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Link
          href={`/profile/therapist/${report.therapist.id}`}
          className="flex-1 bg-white rounded-[0.5rem] border border-bordergray p-4 hover:bg-bordergray/30 hover:cursor-pointer transition-transform duration-200 ease-in-out"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-Noto-Sans text-xs font-medium text-darkgray uppercase tracking-wide">
              Therapist
            </h2>
            <p className="font-Noto-Sans text-base font-semibold text-black">
              {report.therapist.name}
            </p>
            <p className="font-Noto-Sans text-sm text-darkgray">
              {report.therapist.clinic.clinic}
            </p>
          </div>
        </Link>

        <Link
          href={`/profile/patient/${report.patient.id}`}
          className="flex-1 bg-white rounded-[0.5rem] border border-bordergray p-4 hover:bg-bordergray/30 hover:cursor-pointer transition-transform duration-200 ease-in-out"
        >
          <div className="flex flex-col gap-1">
            <h2 className="font-Noto-Sans text-xs font-medium text-darkgray uppercase tracking-wide">
              Patient
            </h2>
            <p className="font-Noto-Sans text-base font-semibold text-black">
              {report.patient.name}
            </p>
            <p className="font-Noto-Sans text-sm text-darkgray">
              {report.patient.sex} • {report.patient.age} old
            </p>
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-y-2">
        <h2 className="font-Noto-Sans text-lg md:text-xl font-semibold text-black">
          Description
        </h2>
        <p className="font-Noto-Sans text-sm text-darkgray ml-0.5 font-medium">
          {report.description}
        </p>
      </div>

      <PDFViewer
        content={report.content}
        title={report.title}
        therapistName={report.therapist.name}
      />
    </div>
  );
}
