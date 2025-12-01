"use client";

/* React Hooks */
import { useState, useRef } from "react";

/* Components */
import Button from "@/components/general/Button";
import Toast from "@/components/general/Toast";
import PatientDetails from "@/components/forms/PatientDetails";
import { Option } from "@/components/general/Select";

/* Actions */
import { createPatient, updatePatient } from "@/lib/actions/patients";

/* Utilities */
import { validateContactNumber } from "@/lib/utils/frontendHelpers";

/* Custom Hooks */
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

interface CreateNewPatientClientProps {
  countryOptions: Option[];
  mode?: "create" | "edit"; // Added mode prop
  initialData?: {
    firstName: string;
    lastName: string;
    birthday: string;
    contactNumber: string;
    countryId: string;
    sex: string;
  };
  patientId?: string;
}

export default function CreateNewPatientClient({
  countryOptions,
  mode = "create", // Default to create
  initialData,
  patientId,
}: CreateNewPatientClientProps) {
  // Navigation Logic
  // Fallback to /search/patients or /dashboard if history is empty
  const { handleBackClick } = useBackNavigation("/search/patients");
  const [isNavigating, setIsNavigating] = useState(false);

  const enhancedHandleBackClick = () => {
    setIsNavigating(true);
    handleBackClick();
  };

  // Form State
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [birthday, setBirthday] = useState(initialData?.birthday || "");
  const [contactNumber, setContactNumber] = useState(
    initialData?.contactNumber || ""
  );
  const [selectedCountry, setSelectedCountry] = useState<Option | null>(
    initialData
      ? countryOptions.find(
          (opt) => opt.value === initialData.countryId.toString()
        ) || null
      : null
  );
  const [selectedSex, setSelectedSex] = useState<Option | null>(
    initialData ? { value: initialData.sex, label: initialData.sex } : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // States related to Toast
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

  const validateForm = (): boolean => {
    // 1. First Name
    if (!firstName.trim()) {
      showToast("Please enter first name", "error");
      return false;
    }

    // 2. Last Name
    if (!lastName.trim()) {
      showToast("Please enter last name", "error");
      return false;
    }

    // 3. Country
    if (!selectedCountry) {
      showToast("Please select a country", "error");
      return false;
    }

    // 4. Birthday
    if (!birthday) {
      showToast("Please select a birthday", "error");
      return false;
    }

    const birthdayDate = new Date(birthday);
    if (birthdayDate > new Date()) {
      showToast("Birthday cannot be in the future", "error");
      return false;
    }

    // 5. Sex
    if (!selectedSex) {
      showToast("Please select sex", "error");
      return false;
    }

    // 6. Contact Number
    if (!contactNumber.trim()) {
      showToast("Please enter contact number", "error");
      return false;
    }

    const isValidContact = validateContactNumber
      ? validateContactNumber(contactNumber)
      : /^[0-9-]+$/.test(contactNumber);

    if (!isValidContact) {
      showToast(
        "Contact number can only contain numbers and dashes (-)",
        "error"
      );
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

    try {
      if (mode === "edit" && patientId) {
        await updatePatient(patientId, formData);
      } else {
        await createPatient(formData);
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
          throw error;
        }
      }

      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} patient:`,
        error
      );
      showToast(
        `Error ${mode === "edit" ? "updating" : "creating"} patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFirstName("");
    setLastName("");
    setBirthday("");
    setContactNumber("");
    setSelectedCountry(null);
    setSelectedSex(null);
    formRef.current?.reset();
  };

  return (
    <div className="flex flex-col gap-y-8 mb-30">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
            {mode === "edit" ? "Edit Patient" : "Create New Patient"}
          </h1>
          <div className="ml-auto mb-auto flex flex-col sm:flex-row items-center gap-2">
            {mode === "edit" && (
              <Button
                id="create-patient-back-btn"
                variant="filled"
                className="w-auto text-xs md:text-base md:w-24"
                onClick={enhancedHandleBackClick}
                disabled={isNavigating || isSubmitting}
              >
                Back
              </Button>
            )}
          </div>
        </div>
        <p className="text-darkgray font-Noto-Sans">
          {mode === "edit"
            ? "Update patient details below."
            : "Enter details to register a patient."}
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-y-8">
          <PatientDetails
            countryOptions={countryOptions}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            birthday={birthday}
            setBirthday={setBirthday}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedSex={selectedSex}
            setSelectedSex={setSelectedSex}
            disabled={isSubmitting}
            ids={{
              firstNameInputId: "create-patient-first-name-input",
              lastNameInputId: "create-patient-last-name-input",
              countrySelectId: "create-patient-country-select",
              birthdayInputId: "create-patient-birthday-input",
              sexSelectId: "create-patient-sex-select",
              contactNumberInputId: "create-patient-contact-number-input",
            }}
          />

          <div className="flex gap-x-4 justify-end">
            <Button
              id="create-patient-clear-form-btn"
              type="button"
              variant="outline"
              className="w-30"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            <Button
              id="create-patient-submit-btn"
              type="submit"
              variant="filled"
              className="w-30"
              disabled={isSubmitting}
            >
              {mode === "edit" ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </form>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
