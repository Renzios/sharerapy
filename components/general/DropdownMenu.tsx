"use client";

import { useEffect, useRef } from "react";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownMenuItem[];
  className?: string;
}

/**
 * A dropdown menu component that appears below a trigger button.
 * Styled consistently with the card components in the project.
 *
 * @param isOpen - Controls whether the dropdown is shown
 * @param onClose - Callback to close the dropdown
 * @param items - Array of menu items with labels and onClick handlers
 * @param className - Additional classes for positioning
 */
export default function DropdownMenu({
  isOpen,
  onClose,
  items,
  className = "",
}: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      // Don't close if clicking the trigger button (it handles its own toggle)
      if (
        (target as HTMLElement).closest('button[aria-label="More options"]')
      ) {
        return;
      }

      onClose();
    };

    // Use capture phase to handle this before other handlers
    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute
        bg-white
        rounded-[0.5rem]
        border border-bordergray
        shadow-lg
        min-w-[120px]
        z-50
        ${className}
      `}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`
            w-full
            text-left
            px-4 py-2
            font-Noto-Sans text-sm font-medium 
            ${
              item.variant === "danger"
                ? "text-red-600 hover:bg-red-50"
                : "text-primary hover:bg-bordergray/30"
            }
            transition-colors duration-200
          `}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
