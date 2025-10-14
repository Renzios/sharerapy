"use client";

import React from "react";
import ReactSelect, { SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: Option | null;
  onChange: (option: SingleValue<Option>) => void;
  placeholder?: string;
  required?: boolean;
  instanceId: string;
  disabled?: boolean;
  width?: string;
  className?: string;
  name?: string;
}

/**
 * A custom Select component wrapping react-select with consistent styling.
 * Features a label above the select and matches the design system.
 *
 * @param props - The select component props
 */
export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  instanceId,
  disabled = false,
  width,
  className = "",
  name,
}: SelectProps) {
  const selectStyles = {
    control: (base: object) => ({
      ...base,
      minHeight: "2.8125rem",
      height: "2.8125rem",
      fontFamily: "'Noto Sans', sans-serif",
      fontSize: "0.875rem",
      backgroundColor: disabled ? "#f9fafb" : "white",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        border: "1px solid #e5e7eb",
      },
    }),
    valueContainer: (base: object) => ({
      ...base,
      padding: "0 16px",
      fontFamily: "'Noto Sans', sans-serif",
    }),
    input: (base: object) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontFamily: "'Noto Sans', sans-serif",
    }),
    menu: (base: object) => ({
      ...base,
      zIndex: 9999,
      fontSize: "0.875rem",
      fontFamily: "'Noto Sans', sans-serif",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
    }),
  };

  return (
    <div className={`flex flex-col gap-y-1 ${width || "w-full"} ${className}`}>
      {label && (
        <label className="font-Noto-Sans text-[0.6875rem] text-black font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <ReactSelect
        instanceId={instanceId}
        options={options}
        value={value}
        onChange={onChange}
        styles={selectStyles}
        placeholder={placeholder}
        classNamePrefix="react-select"
        isDisabled={disabled}
      />
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value?.value || ""}
          required={required}
        />
      )}
    </div>
  );
}
