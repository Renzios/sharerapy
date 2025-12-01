export default function PatientCardSkeleton() {
  return (
    <div className="flex flex-col gap-y-2 bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
      {/* Name Section */}
      <div className="flex flex-col gap-y-1 mb-2">
        <div className="h-7 w-3/4 bg-gray-200 rounded" /> {/* Name */}
        <div className="h-3 w-1/2 bg-gray-200 rounded mt-1" /> {/* Contact */}
      </div>

      {/* Country Section */}
      <div className="flex flex-col gap-y-1">
        <div className="h-3 w-12 bg-gray-200 rounded" /> {/* Label */}
        <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Value */}
      </div>

      {/* Sex Section */}
      <div className="flex flex-col gap-y-1">
        <div className="h-3 w-8 bg-gray-200 rounded" /> {/* Label */}
        <div className="h-4 w-16 bg-gray-200 rounded" /> {/* Value */}
      </div>

      {/* Tags Section (Right Aligned) */}
      <div className="flex justify-end gap-1 mt-2">
        <div className="h-6 w-16 bg-gray-200 rounded-md" />
        <div className="h-6 w-12 bg-gray-200 rounded-md" />
        <div className="h-6 w-20 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}
