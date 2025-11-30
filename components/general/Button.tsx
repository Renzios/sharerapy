import React, { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

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
  aiMode?: boolean;
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
  aiMode = false,
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  const getAiStyles = () => {
    if (!aiMode) return {};

    return {
      border: "2px solid transparent",
      cursor: "pointer",
      background: `
        linear-gradient(#fff, #fff) padding-box, 
        linear-gradient(to right, #3b82f6, #a855f7, #ec4899, #3b82f6) border-box
      `,
      backgroundSize: "200% 100%",
      backgroundPosition: isHovered ? "100% 0" : "0 0",
      transition: "background-position 0.8s ease-in-out, box-shadow 0.3s ease",
      boxShadow: isHovered ? "0 4px 12px rgba(59, 130, 246, 0.25)" : "none",
    };
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex items-center justify-center
        px-3 lg:px-4 py-2
        min-w-0
        font-Noto-Sans
        disabled:opacity-50 disabled:cursor-not-allowed
        
        ${shapeStyles[shape]}
        ${widthStyle}
        ${heightStyle}
        ${fontSizeStyle}
        
        ${!aiMode ? variantStyles[variant] : "text-primary font-semibold"}
        
        ${!aiMode ? "transition-colors duration-200" : ""}
        ${className}
      `}
      style={{
        ...customWidth,
        ...customHeight,
        ...customFontSize,
        ...getAiStyles(),
      }}
    >
      {aiMode && <AutoAwesomeIcon className="mr-2" fontSize="small" />}
      {children}
    </button>
  );
}
