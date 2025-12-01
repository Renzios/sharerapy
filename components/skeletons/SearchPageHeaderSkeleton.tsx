interface SearchPageHeaderSkeletonProps {
  withFilters?: boolean;
  withSort?: boolean;
}

export default function SearchPageHeaderSkeleton({
  withFilters = true,
  withSort = true,
}: SearchPageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full animate-pulse">
      {/* Top Row: Search Input & Mobile Filter */}
      <div className="w-full flex gap-2 items-center">
        {/* Search Bar Skeleton */}
        <div className="flex-1 h-10 lg:h-11.25 bg-gray-200 rounded-lg" />

        {/* Mobile Filter Button Skeleton (Hidden on Desktop) */}
        <div className="w-10 h-10 sm:w-12 sm:h-11.25 bg-gray-200 rounded-full shrink-0 lg:hidden" />
      </div>

      {/* Bottom Row: Navigation Buttons & Desktop Filters */}
      <div className="w-full flex items-center justify-between gap-2 lg:gap-4 min-w-0">
        {/* Navigation Pills (Left) */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 overflow-hidden">
          {/* Create 4 pill shapes for All, Patients, Reports, Therapists */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-7.5 w-16 sm:w-20 bg-gray-200 rounded-full"
            />
          ))}
        </div>

        {/* Desktop Filter & Sort (Right - Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-1 lg:gap-2 min-w-0 shrink ml-auto">
          {/* Filter Button */}
          {withFilters && (
            <div className="h-7.5 w-28 lg:w-32 bg-gray-200 rounded-lg" />
          )}
          {/* Sort Select */}
          {withSort && (
            <div className="h-7.5 w-28 lg:w-32 bg-gray-200 rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}
