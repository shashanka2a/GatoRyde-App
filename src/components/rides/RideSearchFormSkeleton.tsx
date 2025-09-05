'use client'

export function RideSearchFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search Type Toggle */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>

      {/* Location Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded px-4 py-2 whitespace-nowrap flex-shrink-0 w-20" />
          ))}
        </div>
      </div>

      {/* Search Button */}
      <div className="h-14 bg-gray-200 rounded-xl" />
    </div>
  )
}