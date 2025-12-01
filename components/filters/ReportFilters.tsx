"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/general/Button";
import Select, { Option } from "@/components/general/Select";
import Input from "@/components/general/Input";
import { SingleValue, MultiValue } from "react-select";

interface ReportFiltersProps {
  onClose: () => void;
  onUpdateParams: (changes: { [key: string]: string | number | null }) => void;
  languageOptions: Option[];
  countryOptions: Option[];
  clinicOptions: Option[];
  typeOptions: Option[];
  therapistOptions: Option[];
  patientOptions: Option[];
}

export default function ReportFilters({
  onClose,
  onUpdateParams,
  languageOptions,
  countryOptions,
  clinicOptions,
  typeOptions,
  therapistOptions,
  patientOptions,
}: ReportFiltersProps) {
  const searchParams = useSearchParams();

  // --- Single Selects ---
  const [language, setLanguage] = useState<Option | null>(() => {
    const param = searchParams.get("language");
    return languageOptions.find((o) => o.value === param) || null;
  });

  const [country, setCountry] = useState<Option | null>(() => {
    const param = searchParams.get("country");
    return countryOptions.find((o) => o.value === param) || null;
  });

  const [clinic, setClinic] = useState<Option | null>(() => {
    const param = searchParams.get("clinic");
    return clinicOptions.find((o) => o.value === param) || null;
  });

  const [therapist, setTherapist] = useState<Option | null>(() => {
    const param = searchParams.get("therapist");
    return therapistOptions.find((o) => o.value === param) || null;
  });

  const [patient, setPatient] = useState<Option | null>(() => {
    const param = searchParams.get("patient");
    return patientOptions.find((o) => o.value === param) || null;
  });

  // --- Multi Select (Types) ---
  const [types, setTypes] = useState<MultiValue<Option>>(() => {
    const param = searchParams.get("types");
    if (!param) return [];
    const ids = param.split(",");
    return typeOptions.filter((o) => ids.includes(o.value));
  });

  // --- Date Range ---
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const handleApply = () => {
    onUpdateParams({
      language: language ? language.value : null,
      country: country ? country.value : null,
      clinic: clinic ? clinic.value : null,
      therapist: therapist ? therapist.value : null,
      patient: patient ? patient.value : null,
      // Join array into "1,2,3" string
      types: types.length > 0 ? types.map((t) => t.value).join(",") : null,
      startDate: startDate || null,
      endDate: endDate || null,
      p: 1,
    });
    onClose();
  };

  const handleClear = () => {
    setLanguage(null);
    setCountry(null);
    setClinic(null);
    setTherapist(null);
    setPatient(null);
    setTypes([]);
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Row 1: Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Row 2: Type (Multi) */}
        <Select
          label="Report Type"
          instanceId="filter-type-select"
          options={typeOptions}
          value={types}
          // Type safe handler for multi-select
          onChange={(val) => setTypes(val as MultiValue<Option>)}
          placeholder="Select types..."
          isMulti={true}
        />

        <Select
          label="Language"
          instanceId="filter-lang-select"
          options={languageOptions}
          value={language}
          onChange={(val) => setLanguage(val as SingleValue<Option>)}
          placeholder="Select language..."
        />

        {/* Row 3: People */}
        <Select
          label="Therapist"
          instanceId="filter-therapist-select"
          options={therapistOptions}
          value={therapist}
          onChange={(val) => setTherapist(val as SingleValue<Option>)}
          placeholder="Select therapist..."
        />

        <Select
          label="Patient"
          instanceId="filter-patient-select"
          options={patientOptions}
          value={patient}
          onChange={(val) => setPatient(val as SingleValue<Option>)}
          placeholder="Select patient..."
        />

        {/* Row 4: Location */}
        <Select
          label="Clinic"
          instanceId="filter-clinic-select"
          options={clinicOptions}
          value={clinic}
          onChange={(val) => setClinic(val as SingleValue<Option>)}
          placeholder="Select clinic..."
        />

        <Select
          label="Therapist Country"
          instanceId="filter-country-select"
          options={countryOptions}
          value={country}
          onChange={(val) => setCountry(val as SingleValue<Option>)}
          placeholder="Select country..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleClear} className="flex-1">
          Clear
        </Button>
        <Button variant="filled" onClick={handleApply} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
}
