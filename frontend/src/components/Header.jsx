'use client';

import { useState, useEffect } from 'react';

export default function Header({ games = [] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToGame = (slug) => {
    const el = document.getElementById(`game-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07070f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TL</span>
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              TLDR
              <span className="text-purple-400">forme</span>
            </h1>
          </div>

          {/* Game nav pills */}
          <nav className="hidden md:flex items-center gap-2">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => scrollToGame(game.slug)}
                className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white rounded-full
                  transition-colors hover:bg-white/5"
                style={{
                  '--hover-color': game.accentColor,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = game.accentColor)
                }
                onMouseLeave={(e) => (e.target.style.color = '')}
              >
                {game.shortName}
              </button>
            ))}
          </nav>

          {/* Status dot */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
            <span className="text-xs text-gray-500 hidden sm:block">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
