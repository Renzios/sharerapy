"use client";

import { createPortal } from "react-dom";
import Button from "@/components/general/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-[0.5rem] border border-bordergray shadow-lg p-6 max-w-md w-full mx-4 animate-fadeIn">
        {/* Title */}
        <h2 className="font-Noto-Sans text-xl font-semibold text-black mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="font-Noto-Sans text-sm text-darkgray mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-x-3 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
