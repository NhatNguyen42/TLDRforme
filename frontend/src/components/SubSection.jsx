'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  NewspaperIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  PlayIcon,
  GlobeAltIcon,
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import NewsCard from './NewsCard';
import TierChart from './TierChart';

const ICON_MAP = {
  newspaper: NewspaperIcon,
  document: DocumentTextIcon,
  'chart-bar': ChartBarIcon,
  'book-open': BookOpenIcon,
  users: UserGroupIcon,
  play: PlayIcon,
  globe: GlobeAltIcon,
  megaphone: MegaphoneIcon,
  'chat-bubble-left-right': ChatBubbleLeftRightIcon,
};

export default function SubSection({ section, items = [], accentColor }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const Icon = ICON_MAP[section.icon] || NewspaperIcon;
  const visibleItems = items.filter(i => !i.url?.startsWith('pulse://'));

  // Check if this is a tier chart section (has an item with JSON tier data in summary)
  const tierChartItem = section.id === 'tier_list'
    ? visibleItems.find(i => i.summary && i.summary.startsWith('{') && i.summary.includes('"tiers"'))
    : null;
  const isTierChart = !!tierChartItem;

  // Listen for global search events from Header
  useEffect(() => {
    const handler = (e) => {
      const q = e.detail || '';
      setSearchQuery(q);
      // Auto-expand sections with matches, collapse when search clears
      if (q) {
        const hasMatch = visibleItems.some(
          (item) =>
            item.title?.toLowerCase().includes(q) ||
            item.summary?.toLowerCase().includes(q) ||
            item.author?.toLowerCase().includes(q) ||
            item.source?.toLowerCase().includes(q)
        );
        if (hasMatch) setIsOpen(true);
      }
    };
    window.addEventListener('tldr-search', handler);
    return () => window.removeEventListener('tldr-search', handler);
  }, [visibleItems]);

  // Filter items when searching
  const displayItems = searchQuery
    ? visibleItems.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery) ||
          item.summary?.toLowerCase().includes(searchQuery) ||
          item.author?.toLowerCase().includes(searchQuery) ||
          item.source?.toLowerCase().includes(searchQuery)
      )
    : visibleItems;

  return (
    <div className="card rounded-xl overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left group"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}15` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: accentColor }}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
              {section.label}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isTierChart
                ? 'Interactive tier chart'
                : searchQuery && displayItems.length !== visibleItems.length
                  ? `${displayItems.length} of ${visibleItems.length} item${visibleItems.length !== 1 ? 's' : ''}`
                  : visibleItems.length > 0
                    ? `${visibleItems.length} item${visibleItems.length !== 1 ? 's' : ''}`
                    : 'No data yet'}
            </p>
          </div>
        </div>

        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-4 sm:px-5 pb-5">
              <div className="divider mb-5" />

              {isTierChart ? (
                <TierChart tierData={tierChartItem.summary} accentColor={accentColor} />
              ) : displayItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayItems.map((item) => (
                    <NewsCard
                      key={item.id || item.url}
                      item={item}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10" style={{ color: 'var(--text-dim)' }}>
                  <p className="text-sm">
                    No content available yet. Data will appear after the next
                    scrape cycle.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
