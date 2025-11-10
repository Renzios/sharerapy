import React from "react";

interface TagProps {
  text: string;
  fontSize?: string;
  className?: string;
}

export default function Tag({
  text,
  fontSize = "text-sm",
  className = "",
}: TagProps) {
  const baseClasses =
    "flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 font-Noto-Sans font-medium text-black transition-colors duration-200 group-hover:bg-white";

  const combinedClasses = [baseClasses, fontSize, className].join(" ").trim();

  return <div className={combinedClasses}>{text}</div>;
}
