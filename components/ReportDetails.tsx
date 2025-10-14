"use client";

import React, { useState } from "react";
import Input from "@/components/Input";
import TextArea from "@/components/TextArea";
import Select from "@/components/Select";

interface SelectOption {
  value: string;
  label: string;
}

export default function ReportDetails() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption | null>(
    null
  );
  const [selectedTherapyType, setSelectedTherapyType] =
    useState<SelectOption | null>(null);

  // Sample options - replace with actual data
  const languageOptions: SelectOption[] = [
    { value: "en", label: "English" },
    { value: "fl", label: "Filipino" },
    { value: "es", label: "Spanish" },
  ];

  const therapyTypeOptions: SelectOption[] = [
    { value: "physical", label: "Physical Therapy" },
    { value: "occupational", label: "Occupational Therapy" },
    { value: "speech", label: "Speech Therapy" },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
        Report Details
      </h1>

      <div className="flex flex-col gap-y-8">
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
            name="language"
          />
          <Select
            label="Therapy Type"
            instanceId="report-therapy-type"
            options={therapyTypeOptions}
            value={selectedTherapyType}
            onChange={(option) => setSelectedTherapyType(option)}
            placeholder="Select therapy type..."
            required={true}
            name="therapyType"
          />
        </div>
      </div>
    </div>
  );
}
