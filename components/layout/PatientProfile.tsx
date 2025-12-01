"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

import { Tables } from "@/lib/types/database.types";
import Button from "@/components/general/Button";
import ConfirmationModal from "@/components/general/ConfirmationModal";
import Toast from "@/components/general/Toast";
import DeleteIcon from "@mui/icons-material/Delete";

import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";
import { deletePatient } from "@/lib/actions/patients";

type PatientWithRelations = Tables<"patients"> & {
  age?: string;
  country: Tables<"countries">;
  reports: (Tables<"reports"> & {
    therapist: Tables<"therapists"> & {
      clinic: Tables<"clinics"> & {
        country: Tables<"countries">;
      };
    };
    type: Tables<"types">;
    language: Tables<"languages">;
  })[];
};

interface PatientProfileProps {
  patient: PatientWithRelations;
}

export default function PatientProfile({ patient }: PatientProfileProps) {
  const router = useRouter();
  const { therapist } = useTherapistProfile();
  const [isNavigating, setIsNavigating] = useState(false);
  const { handleBackClick } = useBackNavigation("/search/patients");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const enhancedHandleBackClick = () => {
    setIsNavigating(true);
    handleBackClick();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canEdit = patient.reports.some((r) => r.therapist_id === therapist?.id);

  const handleEdit = () => {
    setIsNavigating(true);
    router.push(`/profile/patient/${patient.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePatient(patient.id);
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
          throw error;
        }
      }

      console.error("Error deleting patient:", error);
      setToastMessage("Failed to delete patient. Please try again.");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <div className="flex flex-col gap-y-4 border-b border-bordergray pb-8">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-Noto-Sans font-semibold text-3xl text-black">
                {patient.name}
              </h1>
              {canEdit && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-darkgray hover:text-red-600 cursor-pointer"
                  disabled={isNavigating}
                  title="Delete Patient"
                >
                  <DeleteIcon />
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    className="w-auto text-xs md:text-base md:w-24"
                    onClick={handleEdit}
                    disabled={isNavigating}
                  >
                    Edit
                  </Button>
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

            <p className="font-Noto-Sans text-sm text-darkgray">
              {`+${patient.contact_number || "N/A"}`}
            </p>
          </div>
        </div>
      </div>

      <div
        className="
        grid grid-cols-2 md:grid-cols-4 gap-6 
        rounded-lg border border-bordergray bg-white p-6
      "
      >
        {/* Age */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Age
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.age || "N/A"}
          </p>
        </div>

        {/* Birthday */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Birthday
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {formatDate(patient.birthdate) || "N/A"}
          </p>
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Sex
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.sex || "N/A"}
          </p>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Country
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.country?.country || "N/A"}
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isDeleting}
        confirmButtonID="patient-profile-confirm-delete-btn"
        cancelButtonID="patient-profile-cancel-delete-btn"
      />

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
