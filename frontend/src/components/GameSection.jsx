'use client';

import { useState, useEffect } from 'react';
import SubSection from './SubSection';
import CommunityPulse from './CommunityPulse';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const BANNER_IMAGES = {
  zzz: '/banners/zzz.png',
  ake: '/banners/ake.png',
};

// Decorative pattern for game banners
function BannerPattern({ accentColor }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.03]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export default function GameSection({ game }) {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/games/${encodeURIComponent(game.id)}/feed`,
        );
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setFeed(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [game.id]);

  const lastUpdated = feed?.lastUpdated
    ? new Date(feed.lastUpdated).toLocaleString()
    : null;

  return (
    <section id={`game-${game.slug}`} className="scroll-mt-20">
      {/* Banner */}
      <div
        className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/5"
        style={{
          background: `linear-gradient(135deg, ${game.gradientFrom} 0%, ${game.gradientTo} 100%)`,
        }}
      >
        {/* Background image */}
        {BANNER_IMAGES[game.slug] && (
          <img
            src={BANNER_IMAGES[game.slug]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <BannerPattern accentColor={game.accentColor} />

        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[120px] opacity-20"
          style={{ background: game.accentColor }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-[100px] opacity-10"
          style={{ background: game.accentColor }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                background: `${game.accentColor}20`,
                color: game.accentColor,
              }}
            >
              {game.shortName}
            </span>
            {game.regions?.includes('cn') && (
              <span className="text-xs font-medium tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">
                CN + Global
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">
            {game.name}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl">
            {game.description}
          </p>
          {lastUpdated && (
            <p className="text-gray-600 text-xs mt-3">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Community Pulse */}
      {feed?.pulse && (
        <CommunityPulse pulse={feed.pulse} accentColor={game.accentColor} />
      )}

      {/* Sections */}
      <div className="mt-6 space-y-3">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl skeleton border border-white/5"
            />
          ))
        ) : error ? (
          <div className="text-center py-12 text-gray-500">
            <p>Unable to load data for {game.name}</p>
            <p className="text-xs mt-1">Make sure the backend is running</p>
          </div>
        ) : (
          game.sections.map((section) => (
            <SubSection
              key={section.id}
              section={section}
              items={feed?.sections?.[section.id] || []}
              accentColor={game.accentColor}
            />
          ))
        )}
      </div>
    </section>
  );
}
