import React from "react";

/**
 * Props for the Input component
 */
interface InputProps {
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "date"
    | "time"
    | "datetime-local";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

/**
 * A flexible input component that fills its parent container or accepts custom width.
 * Features a label above the input and supports various input types including calendar inputs.
 *
 * @param props - The input component props
 */
export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  width,
  maxLength,
  required = false,
  disabled = false,
  name,
  id,
  className = "",
}: InputProps) {
  const currentLength = value?.length || 0;

  return (
    <div className={`flex flex-col gap-y-1 ${width || "w-full"} ${className}`}>
      <label
        htmlFor={id}
        className="font-Noto-Sans text-[0.6875rem] text-black font-semibold"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        className="
          h-[2.8125rem]
          bg-white
          border border-bordergray
          rounded-[0.5rem]
          px-4
          font-Noto-Sans text-sm text-black
          placeholder:text-darkgray
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
        "
      />
      {maxLength && (
        <p className="font-Noto-Sans text-[0.6875rem] font-medium text-darkgray text-right">
          {currentLength}/{maxLength}
        </p>
      )}
    </div>
  );
}
