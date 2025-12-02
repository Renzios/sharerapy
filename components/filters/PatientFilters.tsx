"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation"; // We still need this to read initial values
import Button from "@/components/general/Button";
import Select from "@/components/general/Select";
import { SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface PatientFiltersProps {
  onClose: () => void;
  countryOptions: Option[];
  // New Prop: Accepts the updater function from the parent
  onUpdateParams: (changes: { [key: string]: string | number | null }) => void;
}

export default function PatientFilters({
  onClose,
  countryOptions,
  onUpdateParams,
}: PatientFiltersProps) {
  const searchParams = useSearchParams();

  // 1. Initialize state from URL params
  const [sex, setSex] = useState<Option | null>(() => {
    const param = searchParams.get("sex");
    if (!param) return null;
    return { value: param, label: param };
  });

  const [country, setCountry] = useState<Option | null>(() => {
    const param = searchParams.get("country");
    if (!param) return null;
    return countryOptions.find((c) => c.value === param) || null;
  });

  // 2. Handle Apply Logic
  const handleApply = () => {
    // We construct an object of ALL changes we want to make
    onUpdateParams({
      sex: sex ? sex.value : null, // null deletes the param
      country: country ? country.value : null, // null deletes the param
      p: 1, // Always reset to page 1 when filtering
    });

    onClose();
  };

  // 3. Handle Clear Logic
  const handleClear = () => {
    setSex(null);
    setCountry(null);
  };

  const sexOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Select
          label="Country"
          instanceId="filter-country-select"
          options={countryOptions}
          value={country}
          onChange={(val) => setCountry(val as SingleValue<Option>)}
          placeholder="Select country..."
        />

        <Select
          label="Sex"
          instanceId="filter-sex-select"
          options={sexOptions}
          value={sex}
          onChange={(val) => setSex(val as SingleValue<Option>)}
          placeholder="Select sex..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleClear} className="flex-1">
          Clear All
        </Button>
        <Button variant="filled" onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
