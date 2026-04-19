'use client';

import { formatDistanceToNow } from 'date-fns';

function SourceBadge({ source, accentColor }) {
  const labels = {
    prydwen: 'Prydwen',
    game8: 'Game8',
    hoyolab: 'HoYoLAB',
    youtube: 'YouTube',
    bilibili: 'Bilibili',
    official: 'Official',
    grok: 'AI Summary',
  };

  return (
    <span
      className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
      style={{
        background: `${accentColor}15`,
        color: accentColor,
      }}
    >
      {labels[source] || source}
    </span>
  );
}

function RegionBadge({ region }) {
  if (!region) return null;

  const colors = {
    cn: 'bg-red-500/10 text-red-400',
    global: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <span
      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
        colors[region] || 'bg-gray-500/10 text-gray-400'
      }`}
    >
      {region.toUpperCase()}
    </span>
  );
}

export default function NewsCard({ item, accentColor }) {
  const timeAgo = item.publishedAt
    ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })
    : item.scrapedAt
      ? formatDistanceToNow(new Date(item.scrapedAt), { addSuffix: true })
      : null;

  // Don't render pulse:// articles as regular cards
  if (item.url?.startsWith('pulse://')) return null;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block card rounded-xl overflow-hidden transition-all duration-200"
    >
      {/* Thumbnail */}
      {item.imageUrl && (
        <div className="aspect-video overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <SourceBadge source={item.source} accentColor={accentColor} />
          <RegionBadge region={item.region} />
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm transition-colors line-clamp-2 leading-snug" style={{ color: 'var(--text-secondary)' }}>
          {item.title}
        </h4>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs mt-2 line-clamp-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {item.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: '1px solid var(--border-color)' }}>
          {item.author && (
            <span className="text-[11px] truncate max-w-[60%]" style={{ color: 'var(--text-dim)' }}>
              {item.author}
            </span>
          )}
          {timeAgo && (
            <span className="text-[11px] shrink-0" style={{ color: 'var(--text-dim)' }}>{timeAgo}</span>
          )}
        </div>
      </div>
    </a>
  );
}
