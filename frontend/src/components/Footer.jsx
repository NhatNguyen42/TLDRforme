export default function Footer() {
  return (
    <footer className="mt-24" style={{ borderTop: '1px solid var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/Rossi.png" alt="RossiNews" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              RossiNews — Gaming News Dashboard
            </span>
          </div>

          <p className="text-xs text-center sm:text-right max-w-sm" style={{ color: 'var(--text-dim)' }}>
            Content is scraped from public sources and summarized by AI.
            All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
