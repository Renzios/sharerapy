"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

import { Tables } from "@/lib/types/database.types";
import Button from "@/components/general/Button";

type PatientWithRelations = Tables<"patients"> & {
  age?: string;
  country: Tables<"countries">;
  reports: (Tables<"reports"> & {
    therapist: Tables<"therapists"> & {
      clinic: Tables<"clinics"> & {
        country: Tables<"countries">;
      };
    };
    type: Tables<"types">;
    language: Tables<"languages">;
  })[];
};

interface PatientProfileProps {
  patient: PatientWithRelations;
}

export default function PatientProfile({ patient }: PatientProfileProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const { handleBackClick } = useBackNavigation("/search/patients");

  const enhancedHandleBackClick = () => {
    setIsNavigating(true);
    handleBackClick();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <div className="flex flex-col gap-y-4 border-b border-bordergray pb-8">
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center">
              <h1 className="font-Noto-Sans font-semibold text-3xl text-black">
                {patient.name}
              </h1>
              <Button
                variant="filled"
                className="ml-auto w-auto text-xs md:text-base md:w-24"
                onClick={enhancedHandleBackClick}
              >
                Back
              </Button>
            </div>

            <p className="font-Noto-Sans text-sm text-darkgray">
              {`+${patient.contact_number || "N/A"}`}
            </p>
          </div>
        </div>
      </div>

      <div
        className="
        grid grid-cols-2 md:grid-cols-4 gap-6 
        rounded-lg border border-bordergray bg-white p-6
      "
      >
        {/* Age */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Age
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.age || "N/A"}
          </p>
        </div>

        {/* Birthday */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Birthday
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {formatDate(patient.birthdate) || "N/A"}
          </p>
        </div>

        {/* Sex */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Sex
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.sex || "N/A"}
          </p>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-y-1">
          <h2 className="font-Noto-Sans font-medium text-sm text-darkgray">
            Country
          </h2>
          <p className="font-Noto-Sans text-sm text-black font-semibold">
            {patient.country?.country || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
