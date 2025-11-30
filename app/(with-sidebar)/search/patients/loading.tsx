import SearchPageHeaderSkeleton from "@/components/skeletons/SearchPageHeaderSkeleton";
import PatientCardSkeleton from "@/components/skeletons/PatientCardSkeleton";

export default function Loading() {
  return (
    <div>
      {/* Header Skeleton */}
      <SearchPageHeaderSkeleton />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Patient Card Skeletons */}
          {Array.from({ length: 12 }).map((_, index) => (
            <PatientCardSkeleton key={`skeleton-load-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
