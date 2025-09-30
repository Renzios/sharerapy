import Image from "next/image";

/**
 * Props for the TherapistCard component
 */
interface TherapistCardProps {
  /** Therapist data object */
  therapist: {
    /** Unique identifier for the therapist */
    id: number;
    /** Full name of the therapist */
    name: string;
    /** Clinic name */
    clinic: string;
    /** Profile picture URL */
    pictureUrl: string;
    /** Email address */
    email: string;
    /** Country */
    country: string;
  };
}

/**
 * The Therapist Card component displays a therapist's picture, name, and clinic.
 * Meant to be used in a grid layout, adapting to mobile and desktop views.
 *
 * @param props - The therapist card props
 */
export default function TherapistCard({ therapist }: TherapistCardProps) {
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
        src={therapist.pictureUrl}
        alt={therapist.name + " profile"}
        width={200}
        height={200}
        className="rounded-full w-[3.85rem] h-[3.85rem] lg:w-[6.25rem] lg:h-[6.25rem] mb-2"
      />
      <div className="flex flex-col items-center w-full min-w-0 px-2">
        <h1 className="font-Noto-Sans font-medium text-md lg:text-xl text-black text-center break-words whitespace-normal">
          {therapist.name}
        </h1>

        <p className="font-Noto-Sans text-[0.6875rem] lg:text-sm text-darkgray text-center mb-4 break-words whitespace-normal">
          {therapist.clinic}
        </p>

        <p
          title={therapist.email}
          aria-label={therapist.email}
          className="font-Noto-Sans text-[0.5rem] lg:text-[0.6875rem] text-darkgray text-center w-full truncate"
        >
          {therapist.email}
        </p>

        <p className="font-Noto-Sans text-[0.5rem] lg:text-[0.6875rem] text-darkgray text-center break-words whitespace-normal">
          {therapist.country}
        </p>
      </div>
    </div>
  );
}
