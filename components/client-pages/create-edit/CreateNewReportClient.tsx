"use client";

/* React Hooks & NextJS Utilities */
import { useState, useRef, useEffect, useTransition } from "react";

/* Components */
import Button from "@/components/general/Button";
import Toast from "@/components/general/Toast";
import FileUpload from "@/components/forms/FileUpload";
import PatientDetails from "@/components/forms/PatientDetails";
import ReportDetails from "@/components/forms/ReportDetails";
import Select, { Option } from "@/components/general/Select";
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
  patientOptions: Option[];
  countryOptions: Option[];
  languageOptions: Option[];
  typeOptions: Option[];
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
  const [selectedPatient, setSelectedPatient] = useState<Option | null>(
    mode === "edit" && existingReport
      ? patientOptions.find((p) => p.value === existingReport.patient_id) ||
          null
      : null
  );

  const [selectedCountry, setSelectedCountry] = useState<Option | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [selectedSex, setSelectedSex] = useState<Option | null>(null);
  const [contactNumber, setContactNumber] = useState("");

  const [title, setTitle] = useState(existingReport?.title || "");
  const [description, setDescription] = useState(
    existingReport?.description || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Option | null>(
    mode === "edit" && existingReport
      ? languageOptions.find(
          (l) => l.value === existingReport.language_id.toString()
        ) || null
      : null
  );
  const [selectedTherapyType, setSelectedTherapyType] = useState<Option | null>(
    mode === "edit" && existingReport
      ? typeOptions.find(
          (t) => t.value === existingReport.type_id.toString()
        ) || null
      : null
  );

  const [editorContent, setEditorContent] = useState(
    existingReport?.content ? JSON.stringify(existingReport.content) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<EditorRef>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const { user } = useAuth();
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

  useEffect(() => {
    if (selectedPatient) {
      const patient = patients.find((p) => p.id === selectedPatient.value);
      if (patient) {
        setFirstName(patient.first_name || "");
        setLastName(patient.last_name || "");
        setBirthday(patient.birthdate || "");
        setContactNumber(patient.contact_number || "");
        setSelectedSex(
          patient.sex ? { value: patient.sex, label: patient.sex } : null
        );
        const countryOpt = patient.country_id
          ? countryOptions.find(
              (c) => c.value === patient.country_id!.toString()
            )
          : null;
        setSelectedCountry(countryOpt || null);
      }
    } else {
      if (mode === "create") {
        setFirstName("");
        setLastName("");
        setBirthday("");
        setContactNumber("");
        setSelectedSex(null);
        setSelectedCountry(null);
      }
    }
  }, [selectedPatient, patients, countryOptions, mode]);

  const validateForm = (): boolean => {
    if (!selectedPatient) {
      showToast("Please choose a patient", "error");
      return false;
    }
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
    if (
      !editorContent ||
      editorContent.trim() === "" ||
      editorContent === "[]"
    ) {
      showToast("Please enter report content", "error");
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isBlockNotEmpty = (block: any): boolean => {
      if (["table", "divider", "image", "file"].includes(block.type))
        return true;
      if (block.content) {
        if (Array.isArray(block.content)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedContent = JSON.parse(editorContent) as Array<any>;
      if (Array.isArray(parsedContent)) {
        if (!parsedContent.some(isBlockNotEmpty)) {
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

      const editor = BlockNoteEditor.create();
      const markdown = await editor.blocksToMarkdownLossy(
        JSON.parse(editorContent)
      );
      reportFormData.append("markdown", markdown);

      if (mode === "edit" && reportId) {
        await updateReport(reportId, reportFormData);
      } else {
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
      setSelectedPatient(null);
    }
    setTitle("");
    setDescription("");
    setSelectedLanguage(null);
    setSelectedTherapyType(null);
    setEditorContent("");
    formRef.current?.reset();
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-y-8 mb-30">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          {" "}
          <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
            Upload
          </h1>
          <p className="font-Noto-Sans text-sm text-darkgray">
            You may upload an existing report in PDF format to autofill the
            report content section.{" "}
          </p>
        </div>
        <FileUpload
          id="create-edit-report-file-upload"
          onFileUpload={handleFileUpload}
          disabled={isParsing}
        />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-y-8">
          {/* Patient Details */}
          <div className="flex flex-col gap-y-4">
            <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
              Patient Details
            </h1>
            <div className="w-full">
              <Select
                label="Choose Patient"
                instanceId="report-patient-select"
                options={patientOptions}
                value={selectedPatient}
                onChange={(option) =>
                  setSelectedPatient(option as Option | null)
                }
                placeholder="Search for a patient..."
                disabled={mode === "edit"}
                required
                id="create-edit-report-patient-select"
              />
            </div>
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
              disabled={true}
              ids={{
                firstNameInputId: "create-edit-report-patient-first-name-input",
                lastNameInputId: "create-edit-report-patient-last-name-input",
                countrySelectId: "create-edit-report-patient-country-select",
                birthdayInputId: "create-edit-report-patient-birthday-input",
                sexSelectId: "create-edit-report-patient-sex-select",
                contactNumberInputId:
                  "create-edit-report-patient-contact-number-input",
              }}
            />
          </div>

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
