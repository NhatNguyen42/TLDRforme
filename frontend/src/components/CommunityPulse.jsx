'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

export default function CommunityPulse({ pulse, accentColor }) {
  if (!pulse) return null;

  return (
    <div
      className="mt-4 rounded-xl border border-white/5 p-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 60%)`,
      }}
    >
      {/* Subtle glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-10"
        style={{ background: accentColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="w-4 h-4" style={{ color: accentColor }} />
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            Community Pulse
          </span>
          <span className="text-[10px] text-gray-600 ml-auto">
            AI-generated summary
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{pulse}</p>
      </div>
    </div>
  );
}
