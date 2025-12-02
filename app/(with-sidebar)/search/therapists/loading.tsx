import SearchPageHeaderSkeleton from "@/components/skeletons/SearchPageHeaderSkeleton";
import TherapistCardSkeleton from "@/components/skeletons/TherapistCardSkeleton";

export default function Loading() {
  return (
    <div>
      {/* Header Skeleton */}
      <SearchPageHeaderSkeleton />

      <div className="mt-6">
        <div className="grid grid-cols-2 gap-3 lg:gap-6 lg:grid-cols-5">
          {/* Therapist Card Skeletons */}
          {Array.from({ length: 15 }).map((_, index) => (
            <TherapistCardSkeleton key={`skeleton-load-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
