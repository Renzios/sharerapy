"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/general/Button";
import Select from "@/components/general/Select";
import Toast from "@/components/general/Toast";
import ConfirmationModal from "@/components/general/ConfirmationModal";
import DropdownMenu from "@/components/general/DropdownMenu";
import { Tables } from "@/lib/types/database.types";
import PDFViewer from "@/components/blocknote/PDFViewer";
import { useBackNavigation } from "@/app/hooks/useBackNavigation";
import { useTherapistProfile } from "@/app/hooks/useTherapistProfile";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { deleteReport } from "@/lib/actions/reports";

// Type for the report with nested relationships
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

export default function IndivReportClient({ report }: IndivReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { therapist } = useTherapistProfile();
  const [isNavigating, setIsNavigating] = useState(false);
  const { handleBackClick } = useBackNavigation("/search/reports");

  // Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    if (searchParams.get("updated") === "true") {
      setToastMessage("Report updated successfully!");
      setToastType("success");
      setToastVisible(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const enhancedHandleBackClick = () => {
    setIsNavigating(true);
    handleBackClick();
  };

  const [selectedLanguage, setSelectedLanguage] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const languageOptions = [
    { value: "english", label: "English" },
    { value: "filipino", label: "Filipino" },
  ];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReport(report.id);
    } catch (error) {
      // Check if this is a Next.js redirect (which is actually success)
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        // NEXT_REDIRECT errors have digest starting with "NEXT_REDIRECT"
        if (digest?.startsWith("NEXT_REDIRECT")) {
          // This is a successful redirect, just re-throw to let Next.js handle it
          throw error;
        }
      }

      console.error("Error deleting report:", error);
      setToastMessage("Failed to delete report. Please try again.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const dropdownItems = [
    {
      label: "Edit",
      onClick: () => router.push(`/reports/${report.id}/edit`),
      variant: "default" as const,
    },
    {
      label: "Delete",
      onClick: () => setIsDeleteModalOpen(true),
      variant: "danger" as const,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-y-8">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-Noto-Sans text-xl md:text-3xl text-black font-semibold">
              {report.title}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {therapist?.id === report.therapist_id && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen((prev) => !prev);
                    }}
                    className="
                      bg-transparent border border-primary text-primary
                      hover:bg-primary/5 hover:cursor-pointer
                      active:bg-primary active:text-white
                      rounded-[0.5rem]
                      font-Noto-Sans font-semibold
                      px-3 lg:px-4 py-2
                      flex items-center justify-center
                      transition-colors duration-200
                    "
                    aria-label="More options"
                  >
                    <MoreHorizIcon className="text-xl" />
                  </button>
                  <DropdownMenu
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    items={dropdownItems}
                    className="top-full mt-1 right-0"
                  />
                </div>
              )}
              <Button
                variant="filled"
                className="w-auto text-xs md:text-base md:w-24"
                onClick={enhancedHandleBackClick}
                disabled={isNavigating}
              >
                Back
              </Button>
            </div>
          </div>
          <p className="font-Noto-Sans text-[0.6875rem] md:text-sm font-medium text-darkgray ml-0.5">
            {formatDate(report.created_at)} |{" "}
            {report.therapist.clinic.country.country} |{" "}
            {report.language.language} | {report.type.type}
          </p>
        </div>

        {/* Language select */}
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

        {/* Cards */}
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

        {/* Description */}
        <div className="flex flex-col gap-y-2">
          <h2 className="font-Noto-Sans text-lg md:text-xl font-semibold text-black">
            Description
          </h2>
          <p className="font-Noto-Sans text-sm text-darkgray ml-0.5 font-medium">
            {report.description}
          </p>
        </div>

        {/* PDF */}
        <PDFViewer
          content={report.content}
          title={report.title}
          therapistName={report.therapist.name}
        />
      </div>

      {/* Modal rendered outside the page container */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isDeleting}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
