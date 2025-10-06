/**
 * Props for the PatientCard component
 */
interface PatientCardProps {
  patient: {
    id: string | null;
    name: string | null;
    contact_number: string | null;
    country: { id: number; country: string } | null;
    sex: string | null;
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
    <div
      className="
        flex flex-col gap-y-2
        bg-white rounded-[0.5rem] p-6
        border border-bordergray
        hover:bg-bordergray/30 active:bg-black/30 hover:scale-102 active:scale-101 hover:cursor-pointer
        transition-transform duration-200 ease-in-out
 
        "
    >
      <div className="flex flex-col gap-y-1 mb-0 lg:mb-2">
        <h1 className="font-Noto-Sans font-medium text-xl text-black">
          {patient.name}
        </h1>
        <p className="font-Noto-Sans text-[0.6875rem] text-darkgray">
          {patient.contact_number || "N/A"}
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
    </div>
  );
}
