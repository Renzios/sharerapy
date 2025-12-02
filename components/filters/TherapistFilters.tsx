"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/general/Button";
import Select from "@/components/general/Select";
import { SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface TherapistFiltersProps {
  onClose: () => void;
  clinicOptions: Option[];
  countryOptions: Option[];
  onUpdateParams: (changes: { [key: string]: string | number | null }) => void;
}

export default function TherapistFilters({
  onClose,
  clinicOptions,
  countryOptions,
  onUpdateParams,
}: TherapistFiltersProps) {
  const searchParams = useSearchParams();

  // 1. Initialize state from URL params
  const [clinic, setClinic] = useState<Option | null>(() => {
    const param = searchParams.get("clinic");
    if (!param) return null;
    return clinicOptions.find((c) => c.value === param) || null;
  });

  const [country, setCountry] = useState<Option | null>(() => {
    const param = searchParams.get("country");
    if (!param) return null;
    return countryOptions.find((c) => c.value === param) || null;
  });

  // 2. Handle Apply Logic
  const handleApply = () => {
    onUpdateParams({
      clinic: clinic ? clinic.value : null,
      country: country ? country.value : null,
      p: 1, // Reset to page 1
    });

    onClose();
  };

  // 3. Handle Clear Logic
  const handleClear = () => {
    setClinic(null);
    setCountry(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Select
          label="Clinic"
          instanceId="filter-clinic-select"
          options={clinicOptions}
          value={clinic}
          onChange={(val) => setClinic(val as SingleValue<Option>)}
          placeholder="Select clinic..."
        />

        <Select
          label="Country"
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
