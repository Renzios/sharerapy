/* NextJS Utilities */
import Link from "next/link";

/* Types */
import { Tables } from "@/lib/types/database.types";

type ReportWithRelations = Tables<"reports"> & {
  therapist: Tables<"therapists"> & {
    clinic: Tables<"clinics"> & {
      country: Tables<"countries">;
    };
  };
  type: Tables<"types">;
  language: Tables<"languages">;
  patient: Tables<"patients"> & {
    country: Tables<"countries"> | null;
    age?: string;
  };
};

export interface Source {
  id: string;
  report_id: string;
  text: string;
  similarity: number;
  report?: ReportWithRelations | null;
}

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  if (!sources || sources.length === 0) return null;

  const uniqueSources = Array.from(
    new Map(sources.map((item) => [item.report_id, item])).values()
  );

  return (
    <div className="mt-3 w-full">
      <p className="text-xs font-Noto-Sans font-semibold text-darkgray mb-2 uppercase tracking-wide">
        Sources Used
      </p>

      <div className="flex w-full gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent">
        {uniqueSources.map((source) => {
          if (!source.report) return null;

          const therapistName = source.report.therapist?.name
            ? `${source.report.therapist.name}`
            : "Unknown Therapist";

          return (
            <Link
              href={`/reports/${source.report.id}`}
              target="_blank"
              key={source.id}
              className="shrink-0 flex flex-col border border-bordergray bg-white 
                         w-64 md:w-72 rounded-md p-4 hover:bg-bordergray/30 hover:cursor-pointer transition-colors"
            >
              <h1 className="font-Noto-Sans text-xs text-black font-semibold line-clamp-2 mb-1">
                {source.report.title}
              </h1>
              <p className="font-Noto-Sans text-[0.6875rem] text-darkgray">
                By: {therapistName}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
