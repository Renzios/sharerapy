"use client";

import Image from "next/image";
import Link from "next/link";
import { getPublicURL } from "@/lib/utils/storage";
import { formatDistanceToNow } from "date-fns";
import Tag from "@/components/general/Tag";

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    created_at: string; // This is your dateUploaded
    therapist: {
      first_name: string;
      last_name: string;
      picture: string;
      clinic: {
        clinic: string;
        country: {
          country: string;
        };
      };
    };
    type: {
      type: string; // This is your therapyType
    };
    language: {
      language: string;
    };
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const dateUploaded = formatDistanceToNow(new Date(report.created_at), {
    addSuffix: true, // ago
  });

  const therapistName = `${report.therapist.first_name} ${report.therapist.last_name}`;
  const country = report.therapist.clinic.country.country;
  const clinic = report.therapist.clinic.clinic;
  const therapyType = report.type.type;
  const language = report.language.language;

  return (
    <Link
      href={`/reports/${report.id}`}
      className="
        group
        flex flex-col gap-y-2
        bg-white rounded-[0.5rem] p-6
        border border-bordergray
        hover:bg-bordergray/30 hover:cursor-pointer
        transition-transform duration-200 ease-in-out
      "
    >
      <div className="flex items-center gap-x-2 mb-2">
        <Image
          src={getPublicURL(
            "therapist_pictures",
            report.therapist.picture || ""
          )}
          alt="Therapist Profile Picture"
          width={100}
          height={100}
          className="rounded-full object-cover h-[2rem] w-[2rem]"
        />
        <div className="flex gap-x-2">
          <p className="font-Noto-Sans text-sm text-darkgray font-medium">
            Written by {therapistName}
          </p>
          <p className="font-Noto-Sans text-sm text-darkgray font-medium">•</p>
          <p className="font-Noto-Sans text-sm text-darkgray font-medium">
            {dateUploaded}
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col gap-y-2">
          <h1 className="font-Noto-Sans text-lg md:text-xl text-black font-semibold">
            {report.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Tag text={country} fontSize="text-xs" />
            <Tag text={language} fontSize="text-xs" />
            <Tag text={therapyType} fontSize="text-xs" />
            <Tag text={clinic} fontSize="text-xs" />
          </div>
        </div>
      </div>

      <div className="mt-3 mb-3">
        <p className="font-Noto-Sans text-sm text-darkgray line-clamp-2">
          {report.description}
        </p>
      </div>
    </Link>
  );
}
