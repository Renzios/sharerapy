export default function ReportCardSkeleton() {
  return (
    <div className="flex flex-col gap-y-2 bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
      {/* Header: Avatar + Meta Text */}
      <div className="flex items-center gap-x-2 mb-2">
        {/* Avatar Circle */}
        <div className="rounded-full bg-gray-200 h-8 w-8 shrink-0" />

        {/* Meta Text Lines */}
        <div className="flex items-center gap-x-2 w-full">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded-full" /> {/* dot */}
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Title */}
      <div className="h-7 w-3/4 bg-gray-200 rounded mb-1" />

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mt-1">
        <div className="h-6 w-20 bg-gray-200 rounded-md" />
        <div className="h-6 w-16 bg-gray-200 rounded-md" />
        <div className="h-6 w-24 bg-gray-200 rounded-md" />
        <div className="h-6 w-14 bg-gray-200 rounded-md" />
      </div>

      {/* Description Lines */}
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
