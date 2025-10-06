import Image from "next/image";
import { getPublicURL } from "@/lib/utils/storage";

/**
 * Props for the TherapistCard component
 */
interface TherapistCardProps {
  therapist: {
    id: string | null;
    name: string | null;
    picture: string | null;
    clinic: {
      id: number;
      clinic: string;
      country_id: number;
      country: {
        id: number;
        country: string;
      };
    } | null;
  };
}

/**
 * The Therapist Card component displays a therapist's picture, name, and clinic.
 * Meant to be used in a grid layout, adapting to mobile and desktop views.
 *
 * @param props - The therapist card props
 */
export default function TherapistCard({ therapist }: TherapistCardProps) {
  const clinicName = therapist.clinic?.clinic || "N/A";
  const countryName = therapist.clinic?.country?.country || "N/A";

  return (
    <div
      className="
        flex flex-col items-center gap-y-2
        bg-white rounded-[0.5rem] p-3 lg:p-6
        border border-bordergray
        hover:bg-bordergray/30 active:bg-black/30 hover:scale-102 active:scale-101 hover:cursor-pointer
        transition-transform duration-200 ease-in-out
        min-w-0
      "
    >
      <Image
        src={getPublicURL("therapist_pictures", therapist.picture || "")}
        alt={therapist.name + "PFP"}
        width={200}
        height={200}
        className="rounded-full w-[3.85rem] h-[3.85rem] lg:w-[6.25rem] lg:h-[6.25rem] mb-2"
      />
      <div className="flex flex-col items-center w-full min-w-0 px-2">
        <h1 className="font-Noto-Sans font-medium text-md lg:text-xl text-black text-center break-words whitespace-normal">
          {therapist.name}
        </h1>

        <p className="font-Noto-Sans text-[0.6875rem] lg:text-sm text-darkgray text-center mb-4 break-words whitespace-normal">
          {clinicName}
        </p>

        <p className="font-Noto-Sans text-[0.5rem] lg:text-[0.6875rem] text-darkgray text-center break-words whitespace-normal">
          {countryName}
        </p>
      </div>
    </div>
  );
}
