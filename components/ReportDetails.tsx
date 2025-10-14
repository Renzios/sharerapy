"use client";

import React from "react";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Select from "@/components/Select";

interface SelectOption {
  value: string;
  label: string;
}

interface ReportDetailsProps {
  languageOptions: SelectOption[];
  typeOptions: SelectOption[];
  // Controlled state props
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedLanguage: SelectOption | null;
  setSelectedLanguage: (value: SelectOption | null) => void;
  selectedTherapyType: SelectOption | null;
  setSelectedTherapyType: (value: SelectOption | null) => void;
}

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
          />
        </div>

        {/* Row 3: Language and Therapy Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Language"
            instanceId="report-language"
            options={languageOptions}
            value={selectedLanguage}
            onChange={(option) => setSelectedLanguage(option)}
            placeholder="Select language..."
            required={true}
            name="language_id"
          />
          <Select
            label="Therapy Type"
            instanceId="report-therapy-type"
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
