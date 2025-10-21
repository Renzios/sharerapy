"use client";
import Link from "next/link";
import Tag from "@/components/general/Tag";

/**
 * Props for the PatientCard component
 */
interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    contact_number: string;
    country: { id: number; country: string };
    sex: string;
    // 2. Add the reports array to the type
    reports: Array<{
      type: {
        type: string | null;
      } | null;
    }>;
  };
}

/**
 * The Patient Card component displays key information about a patient.
 * It shows the patient's name, contact number, country, and biological sex.
 * Meant to be used in a grid layout, adapting to mobile and desktop views.
 *
 * @param props - The patient card props
 */
export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <Link
      href={`/profile/patient/${patient.id}`}
      className="
        flex flex-col gap-y-2
        bg-white rounded-[0.5rem] p-6
        border border-bordergray
        hover:bg-bordergray/30 hover:cursor-pointer
        transition-transform duration-200 ease-in-out
      "
    >
      <div className="flex flex-col gap-y-1 mb-0 lg:mb-2">
        <h1 className="font-Noto-Sans font-semibold text-xl text-black">
          {patient.name}
        </h1>
        <p className="font-Noto-Sans text-[0.6875rem] text-darkgray">
          +{patient.contact_number || "N/A"}
        </p>
      </div>

      <div className="flex flex-col gap-y-1 lg:gap-y-2">
        <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
          Country
        </h2>
        <p className="font-Noto-Sans text-sm text-black font-semibold">
          {patient.country?.country || "N/A"}
        </p>
      </div>

      <div className="flex flex-col gap-y-1 lg:gap-y-2">
        <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
          Sex
        </h2>
        <p className="font-Noto-Sans text-sm text-black font-semibold">
          {patient.sex}
        </p>
      </div>

      <div className="flex flex-col gap-y-1 lg:gap-y-2 mt-2">
        <div className="flex flex-wrap gap-1 justify-end">
          {patient.reports && patient.reports.length > 0 ? (
            patient.reports.map((report) =>
              report.type?.type ? (
                <Tag
                  key={report.type.type}
                  text={report.type.type}
                  fontSize="text-xs"
                />
              ) : null
            )
          ) : (
            <Tag text="N/A" fontSize="text-xs"></Tag>
          )}
        </div>
      </div>
    </Link>
  );
}
