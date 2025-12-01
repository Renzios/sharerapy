"use client";

/* React Hooks & NextJS Utilities */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* Components */
import Button from "@/components/general/Button";
import Input from "@/components/general/Input";
import TextArea from "@/components/general/TextArea";
import Toast from "@/components/general/Toast";
import ConfirmationModal from "@/components/general/ConfirmationModal";

/* Types */
import { Tables } from "@/lib/types/database.types";

/* Utilities */
import { getPublicURL } from "@/lib/utils/storage";
import { formatDate } from "@/lib/utils/frontendHelpers";

/* Actions */
import { updateTherapist } from "@/lib/actions/therapists";

/* Contexts */
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

/* Hooks */
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

type TherapistRelation = Tables<"therapists"> & {
  clinic: Tables<"clinics"> & {
    country: Tables<"countries">;
  };
};

interface EditTherapistProfileClientProps {
  therapist: TherapistRelation;
}

export default function EditTherapistProfileClient({
  therapist,
}: EditTherapistProfileClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refetch: refetchProfile } = useTherapistProfile();
  const { handleBackClick } = useBackNavigation(
    `/profile/therapist/${therapist.id}`
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  /* Form States */
  const [firstName, setFirstName] = useState(therapist.first_name || "");
  const [lastName, setLastName] = useState(therapist.last_name || "");
  const [bio, setBio] = useState(therapist.bio || "");
  const [age, setAge] = useState(therapist.age?.toString() || "");
  const [picture, setPicture] = useState(therapist.picture || "");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const hasUnsavedChanges = () => {
    return (
      firstName !== (therapist.first_name || "") ||
      lastName !== (therapist.last_name || "") ||
      bio !== (therapist.bio || "") ||
      age !== (therapist.age?.toString() || "") ||
      newPhotoFile !== null
    );
  };

  const enhancedHandleBackClick = () => {
    if (hasUnsavedChanges()) {
      setIsLeaveModalOpen(true);
    } else {
      setIsNavigating(true);
      handleBackClick();
    }
  };

  const confirmLeave = () => {
    setIsLeaveModalOpen(false);
    setIsNavigating(true);
    handleBackClick();
  };

  /* UI States */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (PNG or JPG).", "error");
      return;
    }

    /* Validate file size (max 5MB) */
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        `File size is too large (${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB). Maximum size is 5MB.`,
        "error"
      );
      return;
    }

    setNewPhotoFile(file);

    /* Create preview URL */
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      showToast("Please enter your first name.", "error");
      return false;
    }

    if (!lastName.trim()) {
      showToast("Please enter your last name.", "error");
      return false;
    }

    if (!bio.trim()) {
      showToast("Please write something about yourself.", "error");
      return false;
    }

    if (!age || parseInt(age) <= 0) {
      showToast("Please enter a valid age.", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    /* Add the new photo file if selected */
    if (newPhotoFile) {
      formData.set("picture", newPhotoFile);
    }

    try {
      await updateTherapist(therapist.id, formData);
      showToast("Profile updated successfully!", "success");

      /* Small delay to ensure database generated column updates */
      await new Promise((resolve) => setTimeout(resolve, 200));

      /* Manually refetch therapist profile to update sidebar */
      refetchProfile();

      /* Force a full page refresh to update all cached data */
      router.refresh();

      setTimeout(() => {
        router.push(`/profile/therapist/${therapist.id}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update therapist:", error);
      showToast("Failed to update profile. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-8 mb-30">
      {/* Header */}
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-Noto-Sans text-xl md:text-3xl text-black font-semibold">
            Edit Profile
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="filled"
              className="w-auto text-xs md:text-base md:w-24"
              onClick={enhancedHandleBackClick}
              disabled={isSubmitting || isNavigating}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-8"
      >
        {/* Photo */}
        <div className="flex items-center gap-x-4 md:gap-x-8 border-b border-bordergray pb-8">
          <Image
            src={photoPreview || getPublicURL("therapist_pictures", picture)}
            alt="Therapist Profile Picture"
            width={300}
            height={300}
            className="rounded-full object-cover w-28 h-28 md:h-56 md:w-56"
          />

          <div className="flex flex-col gap-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <Button
              variant="outline"
              type="button"
              className="w-auto"
              onClick={handlePhotoClick}
              disabled={isSubmitting}
            >
              Change Photo
            </Button>
            <p className="font-Noto-Sans text-darkgray text-[0.6875rem] md:text-sm">
              Upload PNG or JPG only • Max 5MB
            </p>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="flex flex-col gap-y-4">
          <h2 className="font-Noto-Sans text-black text-xl md:text-2xl font-semibold">
            Personal Information
          </h2>

          {/* Row 1: First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              name="first_name"
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
              disabled={isSubmitting}
            />
            <Input
              label="Last Name"
              type="text"
              name="last_name"
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Row 2: About Me */}
          <TextArea
            label="About Me"
            name="bio"
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            rows={6}
            maxLength={500}
            required
            disabled={isSubmitting}
          />

          {/* Row 3: Age and Joined Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              name="age"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              required
              disabled={isSubmitting}
            />
            <Input
              label="Joined Date"
              type="text"
              name="joined_date"
              id="joined_date"
              value={formatDate(therapist.created_at)}
              disabled
            />
          </div>
        </div>

        {/* Clinic Information Section */}
        <div className="flex flex-col gap-y-4">
          <h2 className="font-Noto-Sans text-black text-xl md:text-2xl font-semibold">
            Clinic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Clinic Name"
              type="text"
              name="clinic_name"
              id="clinic_name"
              value={therapist.clinic.clinic}
              disabled
            />
            <Input
              label="Country"
              type="text"
              name="country"
              id="country"
              value={therapist.clinic.country.country}
              disabled
            />
          </div>
        </div>

        {/* Hidden field for picture */}
        <input type="hidden" name="picture" value={picture} />
        {/* Hidden field for clinic_id */}
        <input type="hidden" name="clinic_id" value={therapist.clinic_id} />

        {/* Update Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="filled"
            className="w-30"
            disabled={isSubmitting}
          >
            Update
          </Button>
        </div>
      </form>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
        onConfirm={confirmLeave}
        onCancel={() => setIsLeaveModalOpen(false)}
        confirmButtonID="edit-therapist-confirm-leave-btn"
        cancelButtonID="edit-therapist-cancel-leave-btn"
      />
    </div>
  );
}
