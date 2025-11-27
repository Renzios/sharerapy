import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "outline" | "filled";
  shape?: "square" | "pill";
  width?: "auto" | "full" | string;
  height?: "full" | string;
  fontSize?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  id?: string;
}

export default function Button({
  children,
  variant = "filled",
  shape = "square",
  width = "auto",
  height = "auto",
  fontSize = "text-base",
  onClick,
  className = "",
  type = "button",
  disabled = false,
  id,
}: ButtonProps) {
  const variantStyles = {
    outline: [
      "bg-transparent border border-primary text-primary font-semibold",
      "hover:bg-primary/5 hover:cursor-pointer",
      "active:bg-primary active:text-white",
    ].join(" "),
    filled:
      "bg-primary text-white hover:bg-active/80 hover:cursor-pointer active:bg-active",
  };

  const shapeStyles = {
    square: "rounded-[0.5rem]",
    pill: "rounded-full",
  };

  const widthStyle = width === "full" ? "w-full" : "";
  const customWidth = width !== "full" && width !== "auto" ? { width } : {};

  const heightStyle = height === "full" ? "h-full" : "";
  const customHeight = height !== "full" && height !== "auto" ? { height } : {};

  const fontSizeStyle = fontSize.startsWith("text-") ? fontSize : "";
  const customFontSize = !fontSize.startsWith("text-") ? { fontSize } : {};

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${shapeStyles[shape]}
        ${widthStyle}
        ${heightStyle}
        ${fontSizeStyle}
        font-Noto-Sans font-medium
        px-3 lg:px-4 py-2
        flex items-center justify-center
        min-w-0
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        ...customWidth,
        ...customHeight,
        ...customFontSize,
      }}
    >
      {children}
    </button>
  );
}
