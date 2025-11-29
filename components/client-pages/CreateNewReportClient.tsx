"use client";

/* React Hooks & NextJS Utilities */
import { useState, useRef, useTransition } from "react";

/* Components */
import Button from "@/components/general/Button";
import Toast from "@/components/general/Toast";
import FileUpload from "@/components/forms/FileUpload";
import PatientDetails from "@/components/forms/PatientDetails";
import ReportDetails from "@/components/forms/ReportDetails";
import { Editor } from "@/components/blocknote/DynamicEditor";
import { EditorRef } from "@/components/blocknote/Editor";

/* Types */
import { Tables } from "@/lib/types/database.types";

/* Utilities */
import { validateContactNumber } from "@/lib/utils/frontendHelpers";

/* Actions */
import { createReport, updateReport } from "@/lib/actions/reports";
import { createPatient } from "@/lib/actions/patients";
import { parseFile } from "@/lib/actions/parse";

/* Contexts */
import { useAuth } from "@/app/contexts/AuthContext";

// TEMPORARY: Convert to markdown
import { BlockNoteEditor } from "@blocknote/core";

interface SelectOption {
  value: string;
  label: string;
}

interface CreateNewReportClientProps {
  mode?: "create" | "edit";
  reportId?: string; // need this for edit mode (the report being edited)
  existingReport?: {
    // also for edit mode, for autofilling data
    title: string;
    description: string;
    content: unknown;
    language_id: number;
    type_id: number;
    patient_id: string;
  };
  patients: Tables<"patients">[];
  patientOptions: SelectOption[];
  countryOptions: SelectOption[];
  languageOptions: SelectOption[];
  typeOptions: SelectOption[];
}

/**
 * This is the client component for the Create New Report page.
 * It has four main sections: File Upload, Patient Details, Report Details, and Report Content (Blocknote RTE).
 * @param props - The initial data from the server component
 */
export default function CreateNewReportClient({
  mode = "create", // default to create mode
  reportId,
  existingReport,
  patients,
  patientOptions,
  countryOptions,
  languageOptions,
  typeOptions,
}: CreateNewReportClientProps) {
  // Find the existing patient data if in edit mode
  const existingPatient =
    mode === "edit" && existingReport
      ? patients.find((p) => p.id === existingReport.patient_id)
      : null;

  // States related to patientDetails
  const [selectedPatient, setSelectedPatient] = useState<SelectOption | null>(
    mode === "edit" && existingReport
      ? patientOptions.find((p) => p.value === existingReport.patient_id) ||
          null
      : null
  );
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    mode === "edit" && existingPatient && existingPatient.country_id
      ? countryOptions.find(
          (c) => c.value === existingPatient.country_id?.toString()
        ) || null
      : null
  );
  const [firstName, setFirstName] = useState(existingPatient?.first_name || "");
  const [lastName, setLastName] = useState(existingPatient?.last_name || "");
  const [birthday, setBirthday] = useState(existingPatient?.birthdate || "");
  const [selectedSex, setSelectedSex] = useState<SelectOption | null>(
    existingPatient && existingPatient.sex
      ? { value: existingPatient.sex, label: existingPatient.sex }
      : null
  );
  const [contactNumber, setContactNumber] = useState(
    existingPatient?.contact_number || ""
  );

  // States related to ReportDetails
  const [title, setTitle] = useState(existingReport?.title || "");
  const [description, setDescription] = useState(
    existingReport?.description || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption | null>(
    mode === "edit" && existingReport
      ? languageOptions.find(
          (l) => l.value === existingReport.language_id.toString()
        ) || null
      : null
  );
  const [selectedTherapyType, setSelectedTherapyType] =
    useState<SelectOption | null>(
      mode === "edit" && existingReport
        ? typeOptions.find(
            (t) => t.value === existingReport.type_id.toString()
          ) || null
        : null
    );

  // Other states
  const [editorContent, setEditorContent] = useState(
    existingReport?.content ? JSON.stringify(existingReport.content) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<EditorRef>(null);

  // States related to Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const { user } = useAuth();

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleFileUpload = async (file: File) => {
    startTransition(async () => {
      try {
        const markdown = await parseFile(file);
        showToast("PDF converted successfully!", "success");

        if (editorRef.current) {
          await editorRef.current.importMarkdown(markdown);
        }
      } catch (err) {
        console.error("PDF parse error:", err);
        showToast("Failed to convert PDF", "error");
      }
    });
  };

  /**
   * Function to validate the entire form before submission. (client-side)
   * @returns boolean - true if valid, false otherwise
   */
  const validateForm = (): boolean => {
    // Patient Details Validation (only if creating new patient in CREATE mode)
    const isNewPatient = !selectedPatient || selectedPatient.value === "new";

    // Skip patient validation in edit mode (patient cannot be changed)
    if (mode === "create" && isNewPatient) {
      if (!selectedCountry) {
        showToast("Please select patient's country", "error");
        return false;
      }
      if (!firstName.trim()) {
        showToast("Please enter patient's first name", "error");
        return false;
      }
      if (!lastName.trim()) {
        showToast("Please enter patient's last name", "error");
        return false;
      }
      if (!birthday) {
        showToast("Please select patient's birthday", "error");
        return false;
      }

      // Validate birthday is in the past
      const birthdayDate = new Date(birthday);
      if (birthdayDate > new Date()) {
        showToast("Birthday cannot be in the future", "error");
        return false;
      }

      if (!selectedSex) {
        showToast("Please select patient's sex", "error");
        return false;
      }
      if (!contactNumber.trim()) {
        showToast("Please enter patient's contact number", "error");
        return false;
      }

      if (!validateContactNumber(contactNumber)) {
        showToast(
          "Contact number can only contain numbers and dashes (-)",
          "error"
        );
        return false;
      }
    }

    // Report Details Validation
    if (!title.trim()) {
      showToast("Please enter report title", "error");
      return false;
    }

    if (!description.trim()) {
      showToast("Please enter report description", "error");
      return false;
    }

    if (!selectedLanguage) {
      showToast("Please select report language", "error");
      return false;
    }

    if (!selectedTherapyType) {
      showToast("Please select therapy type", "error");
      return false;
    }

    // Report Content Validation
    if (
      !editorContent ||
      editorContent.trim() === "" ||
      editorContent === "[]"
    ) {
      showToast("Please enter report content", "error");
      return false;
    }

    /**
     * Helper function to determine if a single Blocknote block has content.
     */
    const isBlockNotEmpty = (block: {
      type?: string;
      content?:
        | Array<{ type?: string; text?: string; [key: string]: unknown }>
        | string
        | unknown;
      [key: string]: unknown;
    }): boolean => {
      // These types are always considered content, even if visually "empty"
      if (
        block.type === "table" ||
        block.type === "divider" ||
        block.type === "image" ||
        block.type === "file" // Add any other non-text/media block types
      ) {
        return true;
      }

      // Check for text-based content
      if (block.content) {
        // Handle inline content (e.g., in a paragraph or heading)
        if (Array.isArray(block.content)) {
          // Check if *any* item in the content array has text or is a link
          return block.content.some((item) => {
            // Check for links
            if (
              typeof item === "object" &&
              item !== null &&
              item.type === "link"
            ) {
              return true; // A link is always content
            }
            // Check for text
            return (
              typeof item === "object" &&
              item !== null &&
              typeof item.text === "string" &&
              item.text.trim().length > 0
            );
          });
        }

        // Handle 'content' being a simple string (less common, but possible)
        if (typeof block.content === "string") {
          return block.content.trim().length > 0;
        }
      }

      // Default: block is empty (e.g., paragraph with no/empty content)
      return false;
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedContent = JSON.parse(editorContent) as Array<any>;

      if (Array.isArray(parsedContent)) {
        // Check if *any* block in the array is not empty.
        // This will correctly handle the case: [empty, empty, content, empty]
        const hasContent = parsedContent.some(isBlockNotEmpty);

        if (!hasContent) {
          showToast("Please enter report content", "error");
          return false;
        }
      } else {
        // The JSON content should be an array of blocks
        showToast("Invalid report content format", "error");
        return false;
      }
    } catch (e) {
      // If we can't parse, assume it's invalid or empty
      console.error("Failed to parse editor content:", e);
      showToast("Please enter report content", "error");
      return false;
    }

    // --- END REVISED SECTION ---

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    // Ensure user is authenticated (only for create mode)
    if (mode === "create" && !user?.id) {
      showToast("You must be logged in to create a report", "error");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "edit" && reportId) {
        // EDIT MODE - Update existing report
        const reportFormData = new FormData();
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
        reportFormData.append("content", editorContent);
        
        // TEMPORARY: Convert to markdown
        const editor = BlockNoteEditor.create();
        const markdown = await editor.blocksToMarkdownLossy(JSON.parse(editorContent));
        reportFormData.append("markdown", markdown)

        // updateReport will redirect on success
        await updateReport(reportId, reportFormData);
      } else {
        // CREATE MODE - Create new report
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

        // Editor content is guaranteed to be valid by client-side validation
        reportFormData.append("content", editorContent);

        // TEMPORARY: Convert to markdown
        const editor = BlockNoteEditor.create();
        const markdown = await editor.blocksToMarkdownLossy(JSON.parse(editorContent));
        reportFormData.append("markdown", markdown)

        // Use authenticated user's ID as therapist_id
        reportFormData.append("therapist_id", user!.id);

        // Call createReport - it will redirect on success
        await createReport(reportFormData);
      }
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
    if (mode === "create") {
      setSelectedPatient(null);
      setSelectedCountry(null);
      setFirstName("");
      setLastName("");
      setBirthday("");
      setSelectedSex(null);
      setContactNumber("");
    }

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
      {/* File Upload */}
      <div className="flex flex-col gap-y-4">
        <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
          Upload
        </h1>
        <FileUpload
          id="create-edit-report-file-upload"
          onFileUpload={handleFileUpload}
          disabled={isParsing}
        />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-y-8">
          {/* Patient Details */}
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
            disabled={mode === "edit"}
            ids={{
              patientSelectId: "create-edit-report-patient-select",
              countrySelectId: "create-edit-report-country-select",
              firstNameInputId: "create-edit-report-first-name-input",
              lastNameInputId: "create-edit-report-last-name-input",
              birthdayInputId: "create-edit-report-birthday-input",
              sexSelectId: "create-edit-report-sex-select",
              contactNumberInputId: "create-edit-report-contact-number-input",
            }}
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
            ids={{
              titleInputId: "create-edit-report-title-input",
              descriptionTextAreaId: "create-edit-report-description-textarea",
              languageSelectId: "create-edit-report-language-select",
              therapyTypeSelectId: "create-edit-report-therapy-type-select",
            }}
          />

          <div className="flex flex-col gap-y-4">
            <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
              Report Content
              <span className="text-red-500 ml-1">*</span>
            </h1>
            <Editor
              ref={editorRef}
              onChange={setEditorContent}
              value={editorContent}
            />
          </div>

          <div className="flex gap-x-4 justify-end">
            {mode === "create" && (
              <Button
                id="create-report-clear-form-btn"
                type="button"
                variant="outline"
                className="w-30"
                onClick={handleClearForm}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
            )}
            <Button
              id="create-edit-report-submit-btn"
              type="submit"
              variant="filled"
              className="w-30"
              disabled={isSubmitting}
            >
              {mode === "edit" ? "Update" : "Submit"}
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
