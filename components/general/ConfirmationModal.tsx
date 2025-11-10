"use client";

interface ConfirmationModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Callback when confirm is clicked */
  onConfirm: () => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
}

/**
 * A confirmation modal component that displays in the center of the screen.
 * Used for confirming destructive or important actions.
 * Styled consistently with the card components in the project.
 *
 * @param isOpen - Controls whether the modal is shown
 * @param title - The title of the modal
 * @param message - The description/message text
 * @param confirmText - Text for the confirm button (default: "Confirm")
 * @param cancelText - Text for the cancel button (default: "Cancel")
 * @param onConfirm - Callback when user confirms
 * @param onCancel - Callback when user cancels
 * @param isLoading - Whether the confirm action is in progress
 */
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="
          relative
          bg-white rounded-[0.5rem]
          border border-bordergray
          shadow-lg
          p-6
          max-w-md w-full mx-4
          animate-fadeIn
        "
      >
        {/* Title */}
        <h2 className="font-Noto-Sans text-xl font-semibold text-black mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="font-Noto-Sans text-sm text-darkgray mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="
              px-4 py-2
              font-Noto-Sans text-sm font-medium
              text-darkgray
              bg-white
              border border-bordergray
              rounded-[0.5rem]
              hover:bg-bordergray/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="
              px-4 py-2
              font-Noto-Sans text-sm font-medium
              text-white
              bg-primary
              rounded-[0.5rem]
              hover:bg-primary/90
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
