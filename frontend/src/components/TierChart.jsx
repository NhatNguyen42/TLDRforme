'use client';

import { useState, useMemo } from 'react';

const TIER_COLORS = {
  T0:    { bg: 'rgba(255, 127, 127, 0.15)', border: 'rgba(255, 127, 127, 0.4)', text: '#ff7f7f', label: 'T0' },
  'T0.5': { bg: 'rgba(255, 191, 127, 0.15)', border: 'rgba(255, 191, 127, 0.4)', text: '#ffbf7f', label: 'T0.5' },
  T1:    { bg: 'rgba(255, 223, 127, 0.15)', border: 'rgba(255, 223, 127, 0.4)', text: '#ffdf7f', label: 'T1' },
  'T1.5': { bg: 'rgba(191, 255, 127, 0.15)', border: 'rgba(191, 255, 127, 0.4)', text: '#bfff7f', label: 'T1.5' },
  T2:    { bg: 'rgba(127, 255, 127, 0.15)', border: 'rgba(127, 255, 127, 0.4)', text: '#7fff7f', label: 'T2' },
  T3:    { bg: 'rgba(127, 191, 255, 0.15)', border: 'rgba(127, 191, 255, 0.4)', text: '#7fbfff', label: 'T3' },
};

const ROLE_LABELS = {
  dps: 'DPS',
  'sec-dps': 'Sub DPS',
  sdps: 'Sub DPS',
  support: 'Support',
  amplifier: 'Amplifier',
};

function CharacterIcon({ char, accentColor }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={char.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center gap-1"
      title={char.name}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-110"
        style={{
          border: '2px solid var(--border-color)',
          background: 'var(--bg-secondary)',
        }}
      >
        {char.imageUrl && !imgError ? (
          <img
            src={char.imageUrl}
            alt={char.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[10px] font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            {char.name.slice(0, 2)}
          </div>
        )}
      </div>
      <span
        className="text-[10px] sm:text-[11px] text-center leading-tight max-w-[56px] truncate"
        style={{ color: 'var(--text-secondary)' }}
      >
        {char.name}
      </span>
    </a>
  );
}

export default function TierChart({ tierData, accentColor }) {
  const [filterRole, setFilterRole] = useState('all');

  const data = useMemo(() => {
    if (!tierData) return null;
    try {
      return typeof tierData === 'string' ? JSON.parse(tierData) : tierData;
    } catch {
      return null;
    }
  }, [tierData]);

  if (!data || !data.tiers || data.tiers.length === 0) return null;

  // Collect all unique roles
  const allRoles = useMemo(() => {
    const roles = new Set();
    data.tiers.forEach(t => t.characters.forEach(c => {
      if (c.role) roles.add(c.role);
    }));
    return Array.from(roles);
  }, [data]);

  return (
    <div className="space-y-2">
      {/* Role filter pills */}
      {allRoles.length > 1 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Filter:
          </span>
          <button
            onClick={() => setFilterRole('all')}
            className="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
            style={{
              background: filterRole === 'all' ? `${accentColor}20` : 'var(--pill-bg)',
              color: filterRole === 'all' ? accentColor : 'var(--text-muted)',
              border: `1px solid ${filterRole === 'all' ? `${accentColor}40` : 'var(--border-color)'}`,
            }}
          >
            All
          </button>
          {allRoles.map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
              style={{
                background: filterRole === role ? `${accentColor}20` : 'var(--pill-bg)',
                color: filterRole === role ? accentColor : 'var(--text-muted)',
                border: `1px solid ${filterRole === role ? `${accentColor}40` : 'var(--border-color)'}`,
              }}
            >
              {ROLE_LABELS[role] || role}
            </button>
          ))}
        </div>
      )}

      {/* Tier rows */}
      {data.tiers.map((tier) => {
        const colors = TIER_COLORS[tier.label] || TIER_COLORS.T2;
        const chars = filterRole === 'all'
          ? tier.characters
          : tier.characters.filter(c => c.role === filterRole);

        if (chars.length === 0) return null;

        return (
          <div
            key={tier.label}
            className="flex rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.bg,
            }}
          >
            {/* Tier label */}
            <div
              className="flex items-center justify-center shrink-0 w-16 sm:w-20 font-bold text-lg sm:text-xl"
              style={{
                color: colors.text,
                borderRight: `1px solid ${colors.border}`,
                background: `${colors.bg}`,
              }}
            >
              {tier.label}
            </div>

            {/* Characters */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 p-3 sm:p-4 min-h-[72px] items-center">
              {chars.map((char) => (
                <CharacterIcon
                  key={char.name}
                  char={char}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Source attribution */}
      {data.url && (
        <div className="flex items-center justify-between pt-2">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] transition-colors hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Source: Prydwen.gg
          </a>
        </div>
      )}
    </div>
  );
}
