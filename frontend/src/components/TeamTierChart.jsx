'use client';

import { useState, useMemo } from 'react';

const TIER_COLORS = {
  T0:     { bg: 'rgba(255, 127, 127, 0.15)', border: 'rgba(255, 127, 127, 0.4)', text: '#ff7f7f' },
  'T0.5': { bg: 'rgba(255, 191, 127, 0.15)', border: 'rgba(255, 191, 127, 0.4)', text: '#ffbf7f' },
  T1:     { bg: 'rgba(255, 223, 127, 0.15)', border: 'rgba(255, 223, 127, 0.4)', text: '#ffdf7f' },
  'T1.5': { bg: 'rgba(191, 255, 127, 0.15)', border: 'rgba(191, 255, 127, 0.4)', text: '#bfff7f' },
  T2:     { bg: 'rgba(127, 255, 127, 0.15)', border: 'rgba(127, 255, 127, 0.4)', text: '#7fff7f' },
  T3:     { bg: 'rgba(127, 191, 255, 0.15)', border: 'rgba(127, 191, 255, 0.4)', text: '#7fbfff' },
};

const ELEMENT_COLORS = {
  heat:     { bg: 'rgba(255, 100, 50, 0.2)', border: 'rgba(255, 100, 50, 0.5)', text: '#ff6432', label: 'Heat' },
  physical: { bg: 'rgba(200, 200, 200, 0.2)', border: 'rgba(200, 200, 200, 0.5)', text: '#c8c8c8', label: 'Physical' },
  cryo:     { bg: 'rgba(100, 200, 255, 0.2)', border: 'rgba(100, 200, 255, 0.5)', text: '#64c8ff', label: 'Cryo' },
  electric: { bg: 'rgba(180, 130, 255, 0.2)', border: 'rgba(180, 130, 255, 0.5)', text: '#b482ff', label: 'Electric' },
};

function CharacterIcon({ char }) {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={char.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center gap-0.5"
      title={char.name}
    >
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-110"
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
            className="w-full h-full flex items-center justify-center text-[9px] font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            {char.name.slice(0, 2)}
          </div>
        )}
      </div>
      <span
        className="text-[9px] sm:text-[10px] text-center leading-tight max-w-[44px] truncate"
        style={{ color: 'var(--text-secondary)' }}
      >
        {char.name}
      </span>
    </a>
  );
}

function TeamCard({ team }) {
  const elColor = ELEMENT_COLORS[team.element] || null;

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${elColor ? elColor.border : 'var(--border-color)'}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs sm:text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {team.name}
        </span>
        {elColor && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: elColor.bg, color: elColor.text, border: `1px solid ${elColor.border}` }}
          >
            {elColor.label}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 items-start">
        {team.characters.map((char) => (
          <CharacterIcon key={char.name} char={char} />
        ))}
      </div>
    </div>
  );
}

export default function TeamTierChart({ tierData, accentColor }) {
  const [filterElement, setFilterElement] = useState('all');

  const data = useMemo(() => {
    if (!tierData) return null;
    try {
      return typeof tierData === 'string' ? JSON.parse(tierData) : tierData;
    } catch {
      return null;
    }
  }, [tierData]);

  if (!data || !data.tiers || data.tiers.length === 0) return null;

  const allElements = useMemo(() => {
    const els = new Set();
    data.tiers.forEach(t => t.teams.forEach(team => {
      if (team.element) els.add(team.element);
    }));
    return Array.from(els);
  }, [data]);

  return (
    <div className="space-y-2">
      {/* Element filter pills */}
      {allElements.length > 1 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Filter:
          </span>
          <button
            onClick={() => setFilterElement('all')}
            className="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
            style={{
              background: filterElement === 'all' ? `${accentColor}20` : 'var(--pill-bg)',
              color: filterElement === 'all' ? accentColor : 'var(--text-muted)',
              border: `1px solid ${filterElement === 'all' ? `${accentColor}40` : 'var(--border-color)'}`,
            }}
          >
            All
          </button>
          {allElements.map(el => {
            const elColor = ELEMENT_COLORS[el];
            return (
              <button
                key={el}
                onClick={() => setFilterElement(el)}
                className="px-2.5 py-1 text-xs font-medium rounded-full transition-all"
                style={{
                  background: filterElement === el ? `${accentColor}20` : 'var(--pill-bg)',
                  color: filterElement === el ? (elColor?.text || accentColor) : 'var(--text-muted)',
                  border: `1px solid ${filterElement === el ? `${accentColor}40` : 'var(--border-color)'}`,
                }}
              >
                {elColor?.label || el}
              </button>
            );
          })}
        </div>
      )}

      {/* Tier rows */}
      {data.tiers.map((tier) => {
        const colors = TIER_COLORS[tier.label] || TIER_COLORS.T2;
        const teams = filterElement === 'all'
          ? tier.teams
          : tier.teams.filter(t => t.element === filterElement);

        if (teams.length === 0) return null;

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
              }}
            >
              {tier.label}
            </div>

            {/* Teams */}
            <div className="flex flex-col gap-2 p-3 sm:p-4 flex-1 min-w-0">
              {teams.map((team) => (
                <TeamCard key={team.name} team={team} />
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
