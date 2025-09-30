import Image from "next/image";

interface Report {
  title: string;
  description: string;
  dateUploaded: string; // ISO string or formatted date
  country: string;
  language: string;
  therapyType: string;
  clinic: string;
  therapistName: string;
  therapistPFP?: string | null; // URL or base64, optional
}

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
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
      <div className="flex">
        <div className="mb-3">
          <h1 className="font-Noto-Sans text-xl text-black font-semibold">
            {report.title}
          </h1>
          <p className="font-Noto-Sans text-[0.6875rem] font-medium text-darkgray ml-0.5">{`${report.dateUploaded} | ${report.country} | ${report.language} | ${report.therapyType} | ${report.clinic}`}</p>
        </div>
        <div className="ml-auto gap-x-2 hidden md:flex">
          <div className="flex items-center pb-3">
            <h2 className="font-Noto-Sans text-sm text-primary text-right hover:underline">
              {report.therapistName}
            </h2>
          </div>
          <div className="flex">
            <Image
              src={report.therapistPFP || "/testpfp.jpg"}
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
