"use client";

import FileUpload from "@/components/FileUpload";
import PatientDetails from "@/components/PatientDetails";
import ReportDetails from "@/components/ReportDetails";
import { Editor } from "@/components/blocknote/DynamicEditor";
import Button from "@/components/Button";

/**
 * Create new report page
 */
export default function CreateNewReportPage() {
  const handleFileUpload = (file: File) => {
    // Handle the uploaded file
  };

  return (
    <div className="flex flex-col gap-y-8 mb-30">
      <div className="flex flex-col gap-y-4">
        <h1 className="font-Noto-Sans text-2xl font-semibold text-black">
          Upload
        </h1>
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
      <PatientDetails />
      <ReportDetails />
      <Editor />
      <div className="flex gap-x-4 justify-end">
        <Button variant="outline" className="w-30">
          Clear Form
        </Button>
        <Button variant="filled" className="w-30">
          Submit
        </Button>
      </div>
    </div>
  );
}
