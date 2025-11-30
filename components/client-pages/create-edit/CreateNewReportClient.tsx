"use client";

/* React Hooks & NextJS Utilities */
import { useState, useRef, useTransition, useEffect } from "react";

/* Components */
import Button from "@/components/general/Button";
import Toast from "@/components/general/Toast";
import FileUpload from "@/components/forms/FileUpload";
import PatientDetails from "@/components/forms/PatientDetails";
import ReportDetails from "@/components/forms/ReportDetails";
import Select from "@/components/general/Select"; // Added Select for choosing patient
import { Editor } from "@/components/blocknote/DynamicEditor";
import { EditorRef } from "@/components/blocknote/Editor";

/* Types */
import { Tables } from "@/lib/types/database.types";

/* Actions */
import { createReport, updateReport } from "@/lib/actions/reports";
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
  reportId?: string;
  existingReport?: {
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

export default function CreateNewReportClient({
  mode = "create",
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

  // --- Patient State ---
  // In Create mode, we select a patient. In Edit mode, it's pre-filled.
  const [selectedPatient, setSelectedPatient] = useState<SelectOption | null>(
    mode === "edit" && existingReport
      ? patientOptions.find((p) => p.value === existingReport.patient_id) ||
          null
      : null
  );

  // Patient Detail States (Controlled by selectedPatient)
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedSex, setSelectedSex] = useState<SelectOption | null>(null);
  const [contactNumber, setContactNumber] = useState("");

  // --- Report Details State ---
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

  // --- Editor & Form State ---
  const [editorContent, setEditorContent] = useState(
    existingReport?.content ? JSON.stringify(existingReport.content) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<EditorRef>(null);

  // --- Toast State ---
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const { user } = useAuth();

  // --- Hydration Fix State ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // --- Effects ---

  // Auto-fill patient details whenever selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      const patient = patients.find((p) => p.id === selectedPatient.value);
      if (patient) {
        setFirstName(patient.first_name || "");
        setLastName(patient.last_name || "");
        setBirthday(patient.birthdate || "");
        setContactNumber(patient.contact_number || "");

        // Map Sex
        setSelectedSex(
          patient.sex ? { value: patient.sex, label: patient.sex } : null
        );

        // Map Country
        const countryOpt = patient.country_id
          ? countryOptions.find(
              (c) => c.value === patient.country_id!.toString()
            )
          : null;
        setSelectedCountry(countryOpt || null);
      }
    } else {
      // Clear fields if no patient is selected (only in create mode usually)
      if (mode === "create") {
        setFirstName("");
        setLastName("");
        setBirthday("");
        setContactNumber("");
        setSelectedSex(null);
        setSelectedCountry(null);
      }
    }
    // Dependency array includes patients and options to ensure updates if data loads late
  }, [selectedPatient, patients, countryOptions, mode]);

  // Initial load for Edit mode is handled by the initial state of selectedPatient,
  // which triggers the useEffect above.

  // --- Handlers ---

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

  const validateForm = (): boolean => {
    // 1. Patient Validation
    if (!selectedPatient) {
      showToast("Please choose a patient", "error");
      return false;
    }

    // 2. Report Details Validation
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

    // 3. Content Validation
    if (
      !editorContent ||
      editorContent.trim() === "" ||
      editorContent === "[]"
    ) {
      showToast("Please enter report content", "error");
      return false;
    }

    // Helper to check for empty blocks
    const isBlockNotEmpty = (block: any): boolean => {
      if (["table", "divider", "image", "file"].includes(block.type))
        return true;
      if (block.content) {
        if (Array.isArray(block.content)) {
          return block.content.some((item: any) => {
            if (item.type === "link") return true;
            return item.text && item.text.trim().length > 0;
          });
        }
        if (typeof block.content === "string")
          return block.content.trim().length > 0;
      }
      return false;
    };

    try {
      const parsedContent = JSON.parse(editorContent) as Array<any>;
      if (Array.isArray(parsedContent)) {
        const hasContent = parsedContent.some(isBlockNotEmpty);
        if (!hasContent) {
          showToast("Please enter report content", "error");
          return false;
        }
      } else {
        showToast("Invalid report content format", "error");
        return false;
      }
    } catch (e) {
      console.error("Failed to parse editor content:", e);
      showToast("Please enter report content", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (mode === "create" && !user?.id) {
      showToast("You must be logged in to create a report", "error");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Prepare common data
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

      // Generate markdown
      const editor = BlockNoteEditor.create();
      const markdown = await editor.blocksToMarkdownLossy(
        JSON.parse(editorContent)
      );
      reportFormData.append("markdown", markdown);

      if (mode === "edit" && reportId) {
        // Update
        await updateReport(reportId, reportFormData);
      } else {
        // Create
        // We guarantee selectedPatient is not null due to validateForm
        reportFormData.append("patient_id", selectedPatient!.value);
        reportFormData.append("therapist_id", user!.id);
        await createReport(reportFormData);
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        if (digest?.startsWith("NEXT_REDIRECT")) throw error;
      }

      console.error("Error submitting form:", error);
      showToast(
        `Error processing report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    if (mode === "create") {
      setSelectedPatient(null); // This triggers useEffect to clear patient fields
    }
    setTitle("");
    setDescription("");
    setSelectedLanguage(null);
    setSelectedTherapyType(null);
    setEditorContent("");
    formRef.current?.reset();
  };

  // Prevent hydration error from react-select by not rendering until mounted
  if (!mounted) {
    return null;
  }

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
          {/* Patient Details Section */}
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
                Patient Details
              </h1>
              {/* Optional: Add a link to create new patient if needed */}
            </div>

            {/* Patient Selector - Outside PatientDetails component */}
            <div className="w-full">
              <Select
                label="Choose Patient"
                instanceId="report-patient-select"
                options={patientOptions}
                value={selectedPatient}
                onChange={setSelectedPatient}
                placeholder="Search for a patient..."
                disabled={mode === "edit"} // Disabled in edit mode? Usually you can't change patient of existing report
                required
              />
            </div>

            {/* Read-Only Details */}
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
              disabled={true} // Always disabled here as we populate from selection
            />
          </div>

          {/* Report Details */}
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

          {/* Content Editor */}
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

          {/* Action Buttons */}
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
