"use client";

import { useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent scrolling background when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bordergray bg-white">
          <h2 className="font-Noto-Sans font-semibold text-lg text-black">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-darkgray"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
