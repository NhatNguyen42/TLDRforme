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
      className="group block rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden
        hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200"
    >
      {/* Thumbnail */}
      {item.imageUrl && (
        <div className="aspect-video bg-gray-900 overflow-hidden">
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
        <h4 className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h4>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
          {item.author && (
            <span className="text-[11px] text-gray-600 truncate max-w-[60%]">
              {item.author}
            </span>
          )}
          {timeAgo && (
            <span className="text-[11px] text-gray-600 shrink-0">{timeAgo}</span>
          )}
        </div>
      </div>
    </a>
  );
}
