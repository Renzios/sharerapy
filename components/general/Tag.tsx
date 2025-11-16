import React from "react";

interface TagProps {
  text: string;
  fontSize?: string;
  className?: string;
  therapyType?:
    | "speech"
    | "occupational"
    | "sped"
    | "developmental"
    | "reading";
}

export default function Tag({
  text,
  fontSize = "text-sm",
  className = "",
  therapyType,
}: TagProps) {
  const therapyColors = {
    speech: "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200",
    occupational: "bg-amber-100 text-amber-700 group-hover:bg-amber-200",
    sped: "bg-violet-100 text-violet-700 group-hover:bg-violet-200",
    developmental: "bg-rose-100 text-rose-700 group-hover:bg-rose-200",
    reading: "bg-cyan-100 text-cyan-700 group-hover:bg-cyan-200",
  };

  const baseClasses =
    "flex items-center justify-center rounded-full px-3 py-1 font-Noto-Sans font-medium transition-colors duration-200";

  // use therapy type colors if provided, otherwise use default gray
  const colorClasses = therapyType
    ? therapyColors[therapyType]
    : "bg-gray-100 text-black group-hover:bg-white";

  const combinedClasses = [baseClasses, colorClasses, fontSize, className]
    .join(" ")
    .trim();

  return <div className={combinedClasses}>{text}</div>;
}
