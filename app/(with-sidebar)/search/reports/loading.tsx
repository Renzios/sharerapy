import SearchPageHeaderSkeleton from "@/components/skeletons/SearchPageHeaderSkeleton";
import ReportCardSkeleton from "@/components/skeletons/ReportCardSkeleton";

export default function Loading() {
  return (
    <div>
      {/* Render the Header structure so it doesn't jump.
        We pass empty/default values since we just want the layout.
      */}
      <SearchPageHeaderSkeleton />

      {/* Render Skeleton Cards */}

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Render the exact same skeleton loop as your client component */}
          {Array.from({ length: 5 }).map((_, index) => (
            <ReportCardSkeleton key={`skeleton-load-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
