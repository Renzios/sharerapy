"use client";

import Image from "next/image";
import { getPublicURL } from "@/lib/utils/storage";
import Link from "next/link";
import { Tables } from "@/lib/types/database.types";

/**
 * Define the shape of data including nested relations
 */
export type TherapistCardData = Tables<"therapists"> & {
  clinic:
    | (Tables<"clinics"> & {
        country: Tables<"countries"> | null;
      })
    | null;
};

interface TherapistCardProps {
  therapist: TherapistCardData;
}

/**
 * The Therapist Card component displays a therapist's picture, name, and clinic.
 * Meant to be used in a grid layout, adapting to mobile and desktop views.
 */
export default function TherapistCard({ therapist }: TherapistCardProps) {
  const clinicName = therapist.clinic?.clinic || "N/A";
  const countryName = therapist.clinic?.country?.country || "N/A";

  return (
    <Link
      href={`/profile/therapist/${therapist.id}`}
      className="
        flex flex-col items-center gap-y-2
        bg-white rounded-lg p-3 lg:p-6
        border border-bordergray
        hover:bg-bordergray/30 hover:cursor-pointer
        min-w-0
        transition-colors duration-200
      "
    >
      <Image
        src={getPublicURL("therapist_pictures", therapist.picture || "")}
        alt={therapist.name + " PFP"}
        width={200}
        height={200}
        className="rounded-full w-[3.85rem] h-[3.85rem] lg:w-25 lg:h-25 mb-2 object-cover"
      />
      <div className="flex flex-col items-center w-full min-w-0 px-2">
        <h1 className="font-Noto-Sans font-semibold text-md lg:text-xl text-black text-center break-words whitespace-normal">
          {therapist.name}
        </h1>

        <p className="font-Noto-Sans text-[0.6875rem] lg:text-sm text-darkgray text-center mb-4 break-words whitespace-normal">
          {clinicName}
        </p>

        <p className="font-Noto-Sans text-[0.5rem] lg:text-[0.6875rem] text-darkgray text-center break-words whitespace-normal">
          {countryName}
        </p>
      </div>
    </Link>
  );
}
