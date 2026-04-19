export default function Loading() {
  return (
    <main className="min-h-screen bg-[#07070f]">
      {/* Header skeleton */}
      <div className="h-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-32 h-6 skeleton rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        {/* Game section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-56 sm:h-64 rounded-2xl skeleton border border-white/5" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="h-14 rounded-xl skeleton border border-white/5"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
