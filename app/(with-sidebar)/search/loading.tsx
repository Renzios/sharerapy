import SearchPageHeaderSkeleton from "@/components/skeletons/SearchPageHeaderSkeleton";
import PatientCardSkeleton from "@/components/skeletons/PatientCardSkeleton";
import ReportCardSkeleton from "@/components/skeletons/ReportCardSkeleton";
import TherapistCardSkeleton from "@/components/skeletons/TherapistCardSkeleton";

export default function Loading() {
  return (
    <div>
      {/* Header Skeleton */}
      <SearchPageHeaderSkeleton />

      <div className="mt-6 flex flex-col gap-4">
        {/* Patients Section Skeleton */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray animate-pulse bg-gray-200 h-7 w-24 rounded" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <PatientCardSkeleton key={`patient-skeleton-${index}`} />
          ))}
        </div>

        {/* Reports Section Skeleton */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray animate-pulse bg-gray-200 h-7 w-24 rounded mt-2" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <ReportCardSkeleton key={`report-skeleton-${index}`} />
          ))}
        </div>

        {/* Therapists Section Skeleton */}
        <h2 className="text-lg font-medium font-Noto-Sans text-darkgray animate-pulse bg-gray-200 h-7 w-28 rounded mt-2" />
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`therapist-skeleton-${index}`}
              className={
                index === 4
                  ? "col-span-2 flex justify-center lg:col-span-1 lg:block w-full"
                  : ""
              }
            >
              <TherapistCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
