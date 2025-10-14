import React from "react";

/**
 * Props for the TextArea component
 */
interface TextAreaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  width?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  rows?: number;
}

/**
 * A flexible textarea component that fills its parent container or accepts custom width.
 * Features a label above the textarea, character counter, and supports customizable height.
 *
 * @param props - The textarea component props
 */
export default function TextArea({
  label,
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
  rows = 4,
}: TextAreaProps) {
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
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        rows={rows}
        className="
          bg-white
          border border-bordergray
          rounded-[0.5rem]
          px-4
          py-3
          font-Noto-Sans text-sm text-black
          placeholder:text-darkgray
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-all duration-200
          resize-none
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
