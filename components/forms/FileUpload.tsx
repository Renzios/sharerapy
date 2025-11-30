"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import UploadFileIcon from "@mui/icons-material/UploadFile";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  maxSize?: number;
  width?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * A drag-and-drop file upload component specifically for PDF files.
 * Features dashed border styling consistent with PatientCard design.
 * Supports both drag-and-drop and click-to-browse file selection.
 *
 * @param props - The file upload component props
 */
export default function FileUpload({
  onFileUpload,
  maxSize = 10485760, // 10MB default
  width,
  className = "",
  disabled = false,
  id,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxSize,
      multiple: false,
      disabled,
    });

  return (
    <div className={`flex flex-col gap-y-2 ${width || "w-full"} ${className}`}>
      <div
        {...getRootProps()}
        className={`
          h-80
          border-2 border-dashed border-bordergray
          rounded-lg
          bg-white
          flex flex-col items-center justify-center
          transition-all duration-200
          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-primary"
          }
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : disabled
              ? ""
              : "hover:bg-bordergray/30"
          }
        `}
      >
        <input {...getInputProps()} id={id} />
        <div className="text-center px-6">
          {disabled ? (
            <p className="font-Noto-Sans text-sm font-medium animate-pulse">
              <span className="inline-block animate-[color-swap_2.5s_ease-in-out_infinite]">
                Processing file...
              </span>
            </p>
          ) : isDragActive ? (
            <p className="font-Noto-Sans text-sm text-primary font-medium">
              Drop your PDF here...
            </p>
          ) : (
            <>
              <UploadFileIcon
                className="text-bordergray/80!"
                sx={{ fontSize: "10rem" }}
              />
              <p className="font-Noto-Sans text-lg text-black font-medium">
                Drag a file here, or
              </p>
              <p className="font-Noto-Sans text-[0.6875rem] text-primary font-medium mt-1 hover:underline">
                Choose a file to upload
              </p>
              <p className="font-Noto-Sans text-[0.6875rem] text-darkgray mt-4">
                PDF files only • Max {(maxSize / 1048576).toFixed(0)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="flex flex-col gap-y-1">
          {fileRejections[0].errors.map(
            (error: { code: string; message: string }) => (
              <p
                key={error.code}
                className="font-Noto-Sans text-[0.6875rem] text-red-500"
              >
                {error.message}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
