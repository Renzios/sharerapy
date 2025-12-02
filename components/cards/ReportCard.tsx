"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicURL } from "@/lib/utils/storage";
import { formatDistanceToNow } from "date-fns";
import Tag from "@/components/general/Tag";
import DropdownMenu from "@/components/general/DropdownMenu";
import ConfirmationModal from "@/components/general/ConfirmationModal";
import Toast from "@/components/general/Toast";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { deleteReport } from "@/lib/actions/reports";

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    therapist: {
      first_name: string;
      last_name: string;
      picture: string;
      clinic: {
        clinic: string;
        country: {
          country: string;
        };
      };
    };
    type: {
      type: string;
    };
    language: {
      language: string;
    };
    writtenByText?: string; // Optional translated "Written by" text
    editedText?: string; // Optional translated "Edited" text
  };
  showActions?: boolean; // Whether to show edit/delete actions
  disabled?: boolean; // Whether to show disabled state
  id?: string;
}

export default function ReportCard({
  report,
  showActions = false,
  disabled = false,
  id,
}: ReportCardProps) {
  const router = useRouter();

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const isEdited = report.created_at !== report.updated_at;
  const dateUploaded = formatDistanceToNow(new Date(report.created_at), {
    addSuffix: true,
  });

  const therapistName = `${report.therapist.first_name} ${report.therapist.last_name}`;
  const country = report.therapist.clinic.country.country;
  const clinic = report.therapist.clinic.clinic;
  const therapyType = report.type.type;
  const language = report.language.language;

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReport(report.id);
    } catch (error) {
      // Check if this is a Next.js redirect (which is actually success)
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
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
      <div
        className={`
          group
          relative
          flex flex-col gap-y-2
          bg-white rounded-lg p-6
          border border-bordergray
          hover:bg-bordergray/30 hover:cursor-pointer
          transition-transform duration-200 ease-in-out
          ${disabled ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {showActions && (
            <div className="relative dropdown-trigger">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
                className="
                p-1.5
                rounded-full
                text-darkgray
                hover:bg-bordergray/50
                hover:text-black
                transition-all duration-200
                focus:outline-none
              "
                aria-label="More options"
              >
                <MoreHorizIcon className="text-xl" />
              </button>
              <div className="dropdown-menu">
                <DropdownMenu
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  items={dropdownItems}
                  className="top-full mt-1 right-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Link only wraps the main card content */}
        <Link
          href={`/reports/${report.id}`}
          className={`block ${showActions ? "pr-8" : ""}`}
          id={id}
        >
          <div className="flex items-center gap-x-2 mb-2">
            <Image
              src={getPublicURL(
                "therapist_pictures",
                report.therapist.picture || ""
              )}
              alt="Therapist Profile Picture"
              width={100}
              height={100}
              className="rounded-full object-cover h-8 w-8 shrink-0"
            />
            <div className="flex flex-wrap gap-x-2 items-center">
              <p className="font-Noto-Sans text-sm text-darkgray font-medium">
                {report.writtenByText || "Written by"} {therapistName}
              </p>
              <p className="font-Noto-Sans text-sm text-darkgray font-medium">
                •
              </p>
              <p className="font-Noto-Sans text-sm text-darkgray font-medium">
                Created {dateUploaded}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <h1 className="font-Noto-Sans text-lg md:text-xl text-black font-semibold">
              {report.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {isEdited && (
                <Tag text="Edited" fontSize="text-xs" variant="edited" />
              )}
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

          <div className="mt-3 mb-3">
            <p className="font-Noto-Sans text-sm text-darkgray line-clamp-4">
              {report.description}
            </p>
          </div>
        </Link>
      </div>

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

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
