'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function Header({ games = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
      // Ctrl/Cmd+K opens search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const scrollToGame = (slug) => {
    const el = document.getElementById(`game-${slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  // Dispatch search to expand matching sections
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('tldr-search', { detail: searchQuery.trim().toLowerCase() })
      );
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-2xl'
            : ''
        }`}
        style={{
          background: scrolled ? 'var(--bg-header)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TL</span>
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                TLDR
                <span className="text-purple-400">forme</span>
              </h1>
            </div>

            {/* Desktop game nav pills */}
            <nav className="hidden md:flex items-center gap-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => scrollToGame(game.slug)}
                  className="px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'var(--pill-bg)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = game.accentColor;
                    e.target.style.background = `${game.accentColor}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-muted)';
                    e.target.style.background = 'var(--pill-bg)';
                  }}
                >
                  {game.shortName}
                </button>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.target.closest('button').style.background = 'var(--pill-bg)'}
                onMouseLeave={(e) => e.target.closest('button').style.background = 'transparent'}
                aria-label="Search"
                title="Search (Ctrl+K)"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.target.closest('button').style.background = 'var(--pill-bg)'}
                onMouseLeave={(e) => e.target.closest('button').style.background = 'transparent'}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>

              {/* Status dot */}
              <div className="flex items-center gap-2 ml-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
                <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Live</span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg ml-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar (slides down) */}
        {searchOpen && (
          <div
            className="border-t px-4 sm:px-6 lg:px-8 py-3"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="max-w-7xl mx-auto relative">
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, videos..."
                className="w-full pl-10 pr-16 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-hover)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <kbd
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--pill-bg)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                ESC
              </kbd>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t px-4 py-3 space-y-1"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => scrollToGame(game.slug)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.target.style.color = game.accentColor;
                  e.target.style.background = `${game.accentColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-secondary)';
                  e.target.style.background = 'transparent';
                }}
              >
                {game.name}
              </button>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
