import Image from "next/image";
import { getPublicURL } from "@/lib/utils/storage";

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
  // Format the date
  const dateUploaded = new Date(report.created_at).toLocaleDateString();

  // Construct display values from nested data
  const therapistName = `${report.therapist.first_name} ${report.therapist.last_name}`;
  const country = report.therapist.clinic.country.country;
  const clinic = report.therapist.clinic.clinic;
  const therapyType = report.type.type;
  const language = report.language.language;

  return (
    <div
      className="
        flex flex-col gap-y-2
        bg-white rounded-[0.5rem] p-6
        border border-bordergray
        hover:bg-bordergray/30 hover:cursor-pointer
        transition-transform duration-200 ease-in-out
 
        "
    >
      <div className="flex">
        <div className="mb-3">
          <h1 className="font-Noto-Sans text-xl text-black font-semibold">
            {report.title}
          </h1>
          <p className="font-Noto-Sans text-[0.6875rem] font-medium text-darkgray ml-0.5">
            {`${dateUploaded} | ${country} | ${language} | ${therapyType} | ${clinic}`}
          </p>
        </div>
        <div className="ml-auto gap-x-2 hidden md:flex">
          <div className="flex items-center pb-3">
            <h2 className="font-Noto-Sans text-sm text-primary text-right hover:underline">
              {therapistName}
            </h2>
          </div>
          <div className="flex">
            <Image
              src={getPublicURL(
                "therapist_pictures",
                report.therapist.picture || ""
              )}
              alt="Therapist Profile Picture"
              width={100}
              height={100}
              className="rounded-full object-cover h-[2.5rem] w-[2.5rem]"
            />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="font-Noto-Sans text-sm text-darkgray">
          {report.description}
        </p>
      </div>
    </div>
  );
}
