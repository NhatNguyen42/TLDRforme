'use client';

import { useState } from 'react';
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
  const Icon = ICON_MAP[section.icon] || NewspaperIcon;
  const visibleItems = items.filter(i => !i.url?.startsWith('pulse://'));

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
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
            <h3 className="text-base font-semibold text-white group-hover:text-gray-100 transition-colors">
              {section.label}
            </h3>
            <p className="text-xs text-gray-500">
              {visibleItems.length > 0
                ? `${visibleItems.length} item${visibleItems.length !== 1 ? 's' : ''}`
                : 'No data yet'}
            </p>
          </div>
        </div>

        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
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

              {visibleItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleItems.map((item) => (
                    <NewsCard
                      key={item.id || item.url}
                      item={item}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-600">
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
