import React from "react";

interface ButtonProps {
  /** Button content/text */
  children: React.ReactNode;
  /** Button variant - outline or filled */
  variant?: "outline" | "filled";
  /** Button shape - square (8px rounded) or pill (fully rounded) */
  shape?: "square" | "pill";
  /** Width control - 'auto' for content-based, 'full' for w-full, or custom width (e.g., '10rem', '200px') */
  width?: "auto" | "full" | string;
  /** Height control - 'full' for h-full or custom height (e.g., '3rem', '48px') */
  height?: "full" | string;
  /** Font size - can be Tailwind class or custom size (e.g., 'text-sm', '1rem', '14px') */
  fontSize?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Disabled state */
  disabled?: boolean;
}

/**
 * A flexible button component with customizable variant, shape, size, and typography.
 *
 * @param variant - 'outline' uses primary border, 'filled' uses primary background
 * @param shape - 'square' has 8px (0.5rem) rounded corners, 'pill' is fully rounded
 * @param width - 'auto' for content-based width, 'full' for w-full, or custom width string
 * @param height - 'full' for h-full, or custom height string
 * @param fontSize - Tailwind class or custom font size
 */
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
}: ButtonProps) {
  // Determine variant styles
  const variantStyles = {
    outline: [
      "bg-transparent border border-primary text-primary font-semibold",
      "hover:bg-primary/5 hover:cursor-pointer",
      "active:bg-primary active:text-white",
    ].join(" "),
    filled: "bg-primary border border-primary text-white hover:bg-primary/90",
  };

  // Determine shape styles
  const shapeStyles = {
    square: "rounded-[0.5rem]", // 8px = 0.5rem
    pill: "rounded-full",
  };

  // Determine width style
  const widthStyle = width === "full" ? "w-full" : "";
  const customWidth = width !== "full" && width !== "auto" ? { width } : {};

  // Determine height style
  const heightStyle = height === "full" ? "h-full" : "";
  const customHeight = height !== "full" && height !== "auto" ? { height } : {};

  // Determine font size style
  const fontSizeStyle = fontSize.startsWith("text-") ? fontSize : "";
  const customFontSize = !fontSize.startsWith("text-") ? { fontSize } : {};

  return (
    <button
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
