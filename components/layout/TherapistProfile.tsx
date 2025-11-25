"use client";

/* React & NextJS Utilities */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* Components */
import Button from "@/components/general/Button";
/* Types */
import { Tables } from "@/lib/types/database.types";

/* Custom Hooks */
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

/* Contexts */
import { useTherapistProfile } from "@/app/contexts/TherapistProfileContext";

/* Utilities */
import { getPublicURL } from "@/lib/utils/storage";
import { formatDate } from "@/lib/utils/frontendHelpers";

type TherapistRelation = Tables<"therapists"> & {
  clinic: Tables<"clinics"> & {
    country: Tables<"countries">;
  };
};

interface TherapistProfileProps {
  therapist: TherapistRelation;
}

export default function TherapistProfile({ therapist }: TherapistProfileProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { handleBackClick } = useBackNavigation("/search/therapists");
  const { therapist: currentTherapist } = useTherapistProfile();

  const isOwnProfile = currentTherapist?.id === therapist.id;

  const enhancedHandleBackClick = () => {
    setIsNavigating(true);
    handleBackClick();
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <div className="flex flex-col gap-y-4 border-b border-bordergray pb-8">
          <div className="flex items-center gap-x-4 md:gap-x-8">
            <Image
              src={getPublicURL("therapist_pictures", therapist.picture || "")}
              alt="Therapist Profile Picture"
              width={300}
              height={300}
              className="rounded-full object-cover w-[7rem] h-[7rem] md:h-[14rem] md:w-[14rem]"
            />

            <div className="flex justify-center items-center gap-y-2 flex-col">
              <h1 className="font-Noto-Sans text-black text-lg md:text-3xl font-semibold">
                {therapist.name}
              </h1>
              <p className="font-Noto-Sans text-darkgray text-sm md:text-lg self-start ml-0.5">
                {therapist.clinic.clinic}
              </p>
            </div>

            <div className="ml-auto mb-auto flex flex-col sm:flex-row items-center gap-2">
              {isOwnProfile && (
                <Button
                  variant="outline"
                  className="w-12 sm:w-auto text-xs md:text-base md:w-24"
                  onClick={() =>
                    router.push(`/profile/therapist/${therapist.id}/edit`)
                  }
                >
                  Edit
                </Button>
              )}
              <Button
                variant="filled"
                className="w-12 sm:w-auto text-xs md:text-base md:w-24"
                onClick={enhancedHandleBackClick}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="
        grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 
      "
      >
        <div
          className="p-6 bg-white border border-bordergray rounded-lg col-span-1 md:col-span-2 
                    flex flex-col gap-y-3"
        >
          <h2 className="font-Noto-Sans text-black text-lg md:text-2xl font-semibold">
            About Me
          </h2>
          <p className="font-Noto-Sans text-darkgray text-md font-medium">
            {therapist.bio}
          </p>
        </div>
        <div
          className="p-6 bg-white border border-bordergray rounded-lg col-span-1
                        flex flex-col gap-y-3"
        >
          {/* Country */}
          <div className="flex flex-col gap-y-2">
            <h3 className="font-Noto-Sans text-darkgray text-md font-medium">
              Country
            </h3>
            <p className="font-Noto-Sans text-black text-md font-semibold">
              {therapist.clinic.country.country}
            </p>
          </div>

          {/* Age */}
          <div className="flex flex-col gap-y-2">
            <h3 className="font-Noto-Sans text-darkgray text-md font-medium">
              Age
            </h3>
            <p className="font-Noto-Sans text-black text-md font-semibold">
              {therapist.age} Years Old
            </p>
          </div>

          {/* Created */}
          <div className="flex flex-col gap-y-2">
            <h3 className="font-Noto-Sans text-darkgray text-md font-medium">
              Joined
            </h3>
            <p className="font-Noto-Sans text-black text-md font-semibold">
              {formatDate(therapist.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
