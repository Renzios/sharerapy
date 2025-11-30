"use client";

/* React Hooks & NextJS Utilities */
import { useState, useEffect, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/* Components */
import Button from "@/components/general/Button";
import Select, { Option } from "@/components/general/Select";
import Toast from "@/components/general/Toast";
import ConfirmationModal from "@/components/general/ConfirmationModal";
import DropdownMenu from "@/components/general/DropdownMenu";
import Tag from "@/components/general/Tag";
import PDFViewer from "@/components/blocknote/PDFViewer";

/* Types */
import { Tables } from "@/lib/types/database.types";
import { SingleValue, MultiValue } from "react-select";

/* Utilities */
import { formatDate } from "@/lib/utils/frontendHelpers";

/* Custom Hooks */
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

/* Contexts */
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

/* Icons */
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

/* Actions */
import { deleteReport } from "@/lib/actions/reports";
import { translateText } from "@/lib/actions/translate";

/* Others */
import { BlockNoteEditor } from "@blocknote/core";

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
  languageOptions: Option[];
}

export default function IndivReportClient({
  report,
  languageOptions,
}: IndivReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { therapist } = useTherapistProfile();
  const { handleBackClick } = useBackNavigation("/search/reports");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Option | null>(
    () => {
      return (
        languageOptions.find((opt) => opt.value === report.language.code) ||
        null
      );
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [translatedContent, setTranslatedContent] = useState<any>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<
    string | null
  >(null);
  const [translatedEditedText, setTranslatedEditedText] = useState<
    string | null
  >(null);
  const [translatedCreatedText, setTranslatedCreatedText] = useState<
    string | null
  >(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isEdited = report.created_at !== report.updated_at;
  const country = report.therapist.clinic.country.country;
  const clinic = report.therapist.clinic.clinic;
  const therapyType = report.type.type;
  const language = report.language.language;

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

  const getTherapyTypeKey = (
    type: string
  ):
    | "speech"
    | "occupational"
    | "sped"
    | "developmental"
    | "reading"
    | undefined => {
    const normalized = type.toLowerCase().trim();
    if (normalized.includes("speech")) return "speech";
    if (normalized.includes("occupational")) return "occupational";
    if (normalized.includes("sped") || normalized.includes("special ed"))
      return "sped";
    if (normalized.includes("developmental")) return "developmental";
    if (normalized.includes("reading")) return "reading";
    return undefined;
  };

  const handleLanguageChange = async (
    newValue: SingleValue<Option> | MultiValue<Option>
  ) => {
    const option = newValue as Option | null;

    setSelectedLanguage(option);
    if (option) {
      /* If option selected is the original Language of the report, don't translate content but still translate UI text */
      if (option.value === report.language.code) {
        setTranslatedContent(null);
        setTranslatedTitle(null);
        setTranslatedDescription(null);
        setIsTranslating(true);

        // Still translate the "Edited on" and "Created on" UI text
        try {
          const [translatedEditedTextValue, translatedCreatedTextValue] =
            await Promise.all([
              translateText("Edited on", option.value),
              translateText("Created on", option.value),
            ]);
          setTranslatedEditedText(translatedEditedTextValue);
          setTranslatedCreatedText(translatedCreatedTextValue);
        } catch (error) {
          console.error("Translation error:", error);
          setTranslatedEditedText(null);
          setTranslatedCreatedText(null);
        } finally {
          setIsTranslating(false);
        }
        return;
      } else {
        setIsTranslating(true);
        try {
          const editor = BlockNoteEditor.create();
          /* Convert blocks to markdown, since translateText expects markdown */
          const markdown = await editor.blocksToMarkdownLossy(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            report.content as any
          );

          startTransition(async () => {
            try {
              const [
                translatedMarkdown,
                translatedTitleText,
                translatedDescriptionText,
                translatedEditedTextValue,
                translatedCreatedTextValue,
              ] = await Promise.all([
                translateText(markdown, option.value),
                translateText(report.title, option.value),
                translateText(report.description, option.value),
                translateText("Edited on", option.value),
                translateText("Created on", option.value),
              ]);

              if (
                translatedMarkdown &&
                translatedTitleText &&
                translatedDescriptionText
              ) {
                /* Convert translated markdown back to blocks */
                const translatedBlocks = await editor.tryParseMarkdownToBlocks(
                  translatedMarkdown
                );
                setTranslatedContent(translatedBlocks);
                setTranslatedTitle(translatedTitleText);
                setTranslatedDescription(translatedDescriptionText);
                setTranslatedEditedText(translatedEditedTextValue);
                setTranslatedCreatedText(translatedCreatedTextValue);
                setToastMessage("Translation successful!");
                setToastType("success");
                setToastVisible(true);
              }
            } catch (error) {
              console.error("Translation error:", error);
              setToastMessage("Translation failed. Please try again.");
              setToastType("error");
              setToastVisible(true);
            } finally {
              setIsTranslating(false);
            }
          });
        } catch (error) {
          console.error("Translation error:", error);
          setToastMessage("Translation failed. Please try again.");
          setToastType("error");
          setToastVisible(true);
          setIsTranslating(false);
        }
      }
    } else {
      /* If no option selected, reset to original content */
      setTranslatedContent(null);
      setTranslatedTitle(null);
      setTranslatedDescription(null);
      setTranslatedEditedText(null);
      setTranslatedCreatedText(null);
      setIsTranslating(false);
    }
  };

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
      id: "indiv-report-edit-btn",
    },
    {
      label: "Delete",
      onClick: () => setIsDeleteModalOpen(true),
      variant: "danger" as const,
      id: "indiv-report-delete-btn",
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-y-8">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-Noto-Sans text-xl md:text-3xl text-black font-semibold">
              {translatedTitle || report.title}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              {therapist?.id === report.therapist_id && (
                <div className="relative">
                  <button
                    id="indiv-report-dropdown-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen((prev) => !prev);
                    }}
                    className="
                      bg-transparent border border-primary text-primary
                      hover:bg-primary/5 hover:cursor-pointer
                      active:bg-primary active:text-white
                      rounded-lg
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
                id="indiv-report-back-btn"
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
            {isEdited
              ? `${translatedEditedText || "Edited on"} ${formatDate(
                  report.updated_at
                )}`
              : `${translatedCreatedText || "Created on"} ${formatDate(
                  report.created_at
                )}`}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Tag
              text={therapyType}
              fontSize="text-xs"
              therapyType={getTherapyTypeKey(therapyType)}
            />
            <Tag text={country} fontSize="text-xs" />
            <Tag text={language} fontSize="text-xs" />
            <Tag text={clinic} fontSize="text-xs" />
          </div>
        </div>

        {/* Language select */}
        <div className="max-w-md">
          <Select
            label="Display Language"
            options={languageOptions}
            value={selectedLanguage}
            onChange={handleLanguageChange}
            placeholder="Select language..."
            instanceId="display-language-select"
            disabled={isTranslating}
          />
        </div>

        {/* Cards */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <Link
            id="indiv-report-therapist-card-link"
            href={`/profile/therapist/${report.therapist.id}`}
            className="flex-1 bg-white rounded-lg border border-bordergray p-4 hover:bg-bordergray/30 hover:cursor-pointer transition-transform duration-200 ease-in-out"
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
            id="indiv-report-patient-card-link"
            href={`/profile/patient/${report.patient.id}`}
            className="flex-1 bg-white rounded-lg border border-bordergray p-4 hover:bg-bordergray/30 hover:cursor-pointer transition-transform duration-200 ease-in-out"
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
            {translatedDescription || report.description}
          </p>
        </div>

        {/* PDF */}
        {isTranslating ? (
          <div className="w-full h-[600px] flex flex-col items-center justify-center gap-y-4 bg-gray-50/50 border border-bordergray rounded-lg animate-pulse">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p className="font-Noto-Sans text-darkgray text-sm font-medium">
              Translating report content...
            </p>
          </div>
        ) : (
          <PDFViewer
            key={translatedContent ? "translated" : "original"}
            content={translatedContent ? translatedContent : report.content}
            title={translatedTitle || report.title}
            therapistName={report.therapist.name}
          />
        )}
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
        confirmButtonID="indiv-report-confirm-delete-btn"
        cancelButtonID="indiv-report-cancel-delete-btn"
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
