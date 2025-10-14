"use client";

import { useState, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import PatientDetails from "@/components/PatientDetails";
import ReportDetails from "@/components/ReportDetails";
import { Editor } from "@/components/blocknote/DynamicEditor";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import { createReport } from "@/lib/actions/reports";
import { createPatient } from "@/lib/actions/patients";
import { Tables } from "@/lib/types/database.types";

interface SelectOption {
  value: string;
  label: string;
}

interface CreateNewReportClientProps {
  patients: Tables<"patients">[];
  patientOptions: SelectOption[];
  countryOptions: SelectOption[];
  languageOptions: SelectOption[];
  typeOptions: SelectOption[];
}

export default function CreateNewReportClient({
  patients,
  patientOptions,
  countryOptions,
  languageOptions,
  typeOptions,
}: CreateNewReportClientProps) {
  // Patient Details State
  const [selectedPatient, setSelectedPatient] = useState<SelectOption | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedSex, setSelectedSex] = useState<SelectOption | null>(null);
  const [contactNumber, setContactNumber] = useState("");

  // Report Details State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption | null>(
    null
  );
  const [selectedTherapyType, setSelectedTherapyType] =
    useState<SelectOption | null>(null);

  // Other State
  const [editorContent, setEditorContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Toast State
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

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      let patientId = formData.get("patient_id") as string;

      // Check if we need to create a new patient (no selection or "new" selected)
      if (!patientId || patientId === "new") {
        const patientFormData = new FormData();
        patientFormData.append(
          "first_name",
          formData.get("first_name") as string
        );
        patientFormData.append(
          "last_name",
          formData.get("last_name") as string
        );
        patientFormData.append(
          "birthdate",
          formData.get("birthdate") as string
        );
        patientFormData.append("sex", formData.get("sex") as string);
        patientFormData.append(
          "contact_number",
          formData.get("contact_number") as string
        );
        patientFormData.append(
          "country_id",
          formData.get("country_id") as string
        );

        const newPatient = await createPatient(patientFormData);
        patientId = newPatient.id;
      }

      const reportFormData = new FormData();
      reportFormData.append("patient_id", patientId);
      reportFormData.append("title", formData.get("title") as string);
      reportFormData.append(
        "description",
        formData.get("description") as string
      );
      reportFormData.append(
        "language_id",
        formData.get("language_id") as string
      );
      reportFormData.append("type_id", formData.get("type_id") as string);

      // Handle editor content - use empty array if no content
      let contentJson;
      try {
        contentJson = editorContent ? JSON.parse(editorContent) : [];
      } catch (e) {
        console.error("Error parsing editor content:", e);
        contentJson = [];
      }
      reportFormData.append("content", JSON.stringify(contentJson));

      reportFormData.append(
        "therapist_id",
        "5646f7f9-cf5b-48ff-a961-d8fabeab8f7b"
      );

      // Call createReport - it will redirect on success
      // The success toast will be shown on the destination page
      await createReport(reportFormData);
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

      // This is a real error (not a redirect), show error toast
      console.error("Error submitting form:", error);
      showToast(
        `Error creating report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    // Clear Patient Details
    setSelectedPatient(null);
    setSelectedCountry(null);
    setFirstName("");
    setLastName("");
    setBirthday("");
    setSelectedSex(null);
    setContactNumber("");

    // Clear Report Details
    setTitle("");
    setDescription("");
    setSelectedLanguage(null);
    setSelectedTherapyType(null);

    // Clear Editor
    setEditorContent("");

    // Reset form
    formRef.current?.reset();
  };

  return (
    <div className="flex flex-col gap-y-8 mb-30">
      <div className="flex flex-col gap-y-4">
        <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
          Upload
        </h1>
        <FileUpload onFileUpload={handleFileUpload} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-y-8">
          <PatientDetails
            patients={patients}
            patientOptions={patientOptions}
            countryOptions={countryOptions}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            birthday={birthday}
            setBirthday={setBirthday}
            selectedSex={selectedSex}
            setSelectedSex={setSelectedSex}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
          />
          <ReportDetails
            languageOptions={languageOptions}
            typeOptions={typeOptions}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedTherapyType={selectedTherapyType}
            setSelectedTherapyType={setSelectedTherapyType}
          />

          <div className="flex flex-col gap-y-4">
            <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
              Report Content
            </h1>
            <Editor onChange={setEditorContent} value={editorContent} />
          </div>

          <div className="flex gap-x-4 justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-30"
              onClick={handleClearForm}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              variant="filled"
              className="w-30"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
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
