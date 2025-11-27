"use client";

import Input from "@/components/general/Input";
import TextArea from "@/components/general/TextArea";
import Select from "@/components/general/Select";

interface SelectOption {
  value: string;
  label: string;
}

interface ReportDetailsProps {
  languageOptions: SelectOption[];
  typeOptions: SelectOption[];
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedLanguage: SelectOption | null;
  setSelectedLanguage: (value: SelectOption | null) => void;
  selectedTherapyType: SelectOption | null;
  setSelectedTherapyType: (value: SelectOption | null) => void;
  ids?: {
    titleInputId?: string;
    descriptionTextAreaId?: string;
    languageSelectId?: string;
    therapyTypeSelectId?: string;
  };
}

/**
 * The Report Details component is the form for creating a new Report.
 * All fields are required.
 *
 * @param props - The report details props
 */
export default function ReportDetails({
  languageOptions,
  typeOptions,
  title,
  setTitle,
  description,
  setDescription,
  selectedLanguage,
  setSelectedLanguage,
  selectedTherapyType,
  setSelectedTherapyType,
  ids,
}: ReportDetailsProps) {
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
        Report Details
      </h1>

      <div className="flex flex-col gap-y-4">
        {/* Row 1: Title (spans entire width) */}
        <div>
          <Input
            label="Title"
            type="text"
            placeholder="Enter report title"
            value={title}
            required={true}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            name="title"
            id={ids?.titleInputId}
          />
        </div>

        {/* Row 2: Description (taller textarea) */}
        <div>
          <TextArea
            label="Description"
            placeholder="Enter report description"
            value={description}
            required={true}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            name="description"
            id={ids?.descriptionTextAreaId}
          />
        </div>

        {/* Row 3: Language and Therapy Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            id={ids?.languageSelectId}
            label="Language"
            instanceId={ids?.languageSelectId ?? ""}
            options={languageOptions}
            value={selectedLanguage}
            onChange={(option) => setSelectedLanguage(option)}
            placeholder="Select language..."
            required={true}
            name="language_id"
          />
          <Select
            id={ids?.therapyTypeSelectId}
            label="Therapy Type"
            instanceId={ids?.therapyTypeSelectId ?? ""}
            options={typeOptions}
            value={selectedTherapyType}
            onChange={(option) => setSelectedTherapyType(option)}
            placeholder="Select therapy type..."
            required={true}
            name="type_id"
          />
        </div>
      </div>
    </div>
  );
}
