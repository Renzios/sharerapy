export default function TherapistCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-y-2 bg-white rounded-lg p-3 lg:p-6 border border-gray-200 animate-pulse h-full">
      {/* Avatar Circle */}
      <div className="rounded-full bg-gray-200 w-[3.85rem] h-[3.85rem] lg:w-25 lg:h-25 mb-2 shrink-0" />

      <div className="flex flex-col items-center w-full px-2 gap-y-2">
        {/* Name */}
        <div className="h-5 lg:h-6 w-3/4 bg-gray-200 rounded" />

        {/* Clinic */}
        <div className="h-3 lg:h-4 w-2/3 bg-gray-200 rounded mt-1" />

        {/* Country */}
        <div className="h-2.5 lg:h-3 w-1/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
