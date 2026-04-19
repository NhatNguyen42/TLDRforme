export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">TL</span>
            </div>
            <span className="text-sm text-gray-500">
              TLDRforme — Gaming News Dashboard
            </span>
          </div>

          <p className="text-xs text-gray-700 text-center sm:text-right max-w-sm">
            Content is scraped from public sources and summarized by AI.
            All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
