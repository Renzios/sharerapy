"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  /** Toast message content */
  message: string;
  /** Toast type - success, error, or info */
  type?: "success" | "error" | "info";
  /** Whether the toast is visible */
  isVisible: boolean;
  /** Callback to hide the toast */
  onClose: () => void;
  /** Duration in milliseconds before auto-close (default: 5000ms) */
  duration?: number;
}

/**
 * A toast notification component that displays temporary messages.
 * Automatically closes after a specified duration with smooth fade-out animation.
 * Styled consistently with the card components in the project.
 *
 * @param message - The text to display in the toast
 * @param type - The type of toast (success, error, or info)
 * @param isVisible - Controls whether the toast is shown
 * @param onClose - Callback function to close the toast
 * @param duration - Time in ms before auto-close (default: 5000)
 */
export default function Toast({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);

      if (duration > 0) {
        const timer = setTimeout(() => {
          // Start fade-out animation
          setIsExiting(true);

          // Wait for animation to complete before calling onClose
          setTimeout(() => {
            onClose();
          }, 300); // Match the animation duration
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  // Icon for each type
  const typeIcons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{
        animation: isExiting
          ? "slideOut 0.3s ease-in forwards"
          : "slideIn 0.3s ease-out",
      }}
    >
      <div
        className="
          flex items-center gap-x-3
          bg-white rounded-[0.5rem] p-4 pr-6
          border-l-4 border-primary
          shadow-lg
          transition-all duration-300 ease-in-out
          min-w-[300px] max-w-[500px]
        "
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white font-bold text-sm">
          {typeIcons[type]}
        </div>

        <p className="font-Noto-Sans text-sm font-medium text-black flex-1">
          {message}
        </p>

        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              onClose();
            }, 300);
          }}
          className="
            text-darkgray hover:text-black
            transition-colors duration-200
            ml-2 text-lg leading-none
            focus:outline-none
          "
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  );
}
