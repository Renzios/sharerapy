"use client";

import ReactSelect, {
  SingleValue,
  MultiValue,
  ActionMeta,
  GroupBase,
  Props as ReactSelectProps,
} from "react-select";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: Option | MultiValue<Option> | null;
  onChange: (
    newValue: SingleValue<Option> | MultiValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
  placeholder?: string;
  required?: boolean;
  instanceId: string;
  disabled?: boolean;
  width?: string;
  className?: string;
  name?: string;
  id?: string;
  isMulti?: boolean;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  width,
  className = "",
  name,
  id,
  isMulti = false,
}: SelectProps) {
  const selectStyles: ReactSelectProps<
    Option,
    boolean,
    GroupBase<Option>
  >["styles"] = {
    control: (base, state) => ({
      ...base,
      minHeight: "2.8125rem",
      fontFamily: "'Noto Sans', sans-serif",
      fontSize: "0.875rem",
      backgroundColor: disabled ? "#f3f4f6" : "white",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      boxShadow: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      "&:hover": {
        border: "1px solid #e5e7eb",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 16px",
      fontFamily: "'Noto Sans', sans-serif",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontFamily: "'Noto Sans', sans-serif",
    }),
    placeholder: (base) => ({
      ...base,
      color: disabled ? "#9ca3af" : "#6b7280",
    }),
    singleValue: (base) => ({
      ...base,
      color: disabled ? "#9ca3af" : "#030712",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: "0.875rem",
      fontFamily: "'Noto Sans', sans-serif",
      borderRadius: "0.5rem",
      border: "1px solid #e5e7eb",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#e5e7eb",
      borderRadius: "0.25rem",
    }),
  };

  return (
    <div
      className={`flex flex-col gap-y-1 ${width || "w-full"} ${className}`}
      style={{ cursor: disabled ? "not-allowed" : "default" }}
    >
      {label && (
        <label className="font-Noto-Sans text-[0.6875rem] text-black font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <ReactSelect
        instanceId={id}
        options={options}
        value={value}
        onChange={onChange}
        styles={selectStyles}
        placeholder={placeholder}
        classNamePrefix="react-select"
        isDisabled={disabled}
        isMulti={isMulti}
      />
      {/* Hidden input for form submission (only works for single value mostly) */}
      {name && !isMulti && (
        <input
          id={id}
          type="hidden"
          name={name}
          value={(value as Option)?.value || ""}
          required={required}
        />
      )}
    </div>
  );
}
