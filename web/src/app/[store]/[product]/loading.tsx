export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav skeleton */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="skeleton h-5 w-24 rounded" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
      </div>

      {/* Image skeleton */}
      <div className="max-w-3xl mx-auto bg-white">
        <div className="skeleton aspect-square" />
      </div>

      {/* Details skeleton */}
      <div className="max-w-3xl mx-auto bg-white px-4 pt-5 pb-6 space-y-4">
        <div className="skeleton h-7 w-3/4 rounded-lg" />
        <div className="skeleton h-9 w-40 rounded-lg" />
        <div className="skeleton h-4 w-20 rounded" />
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}
