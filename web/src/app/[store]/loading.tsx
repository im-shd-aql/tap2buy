export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero skeleton */}
      <div className="skeleton h-52 sm:h-64" />

      {/* Search bar skeleton */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="skeleton h-12 rounded-2xl" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-32 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="skeleton aspect-square" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
