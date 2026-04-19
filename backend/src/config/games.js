const games = [
  {
    id: 'zenless-zone-zero',
    name: 'Zenless Zone Zero',
    shortName: 'ZZZ',
    slug: 'zzz',
    accentColor: '#BFFF00',
    gradientFrom: '#1a1a2e',
    gradientTo: '#16213e',
    description: 'Urban fantasy action RPG by HoYoverse',
    regions: ['global'],
    sources: {
      tier_list: [
        { type: 'prydwen', url: 'https://www.prydwen.gg/zenless/tier-list' },
      ],
      guides: [
        { type: 'prydwen', url: 'https://www.prydwen.gg/zenless' },
      ],
      news: [
        { type: 'hoyolab', gids: 8, menuId: 58 },
      ],
      patch_notes: [
        { type: 'patch-notes', method: 'hoyolab', gids: 8 },
      ],
      community_official: [
        { type: 'hoyolab-web', gids: 8 },
      ],
      community_reddit: [
        { type: 'reddit', subreddit: 'ZenlessZoneZero' },
      ],
      videos: [
        { type: 'youtube', channelId: 'UC2SpC8rL9LaeQriE4YNdyzA', handle: 'ZZZ_Official', name: 'Zenless Zone Zero Official' },
        { type: 'youtube', channelId: 'UCPnSoX7NkOBcOX0Gfw_yjAw', handle: 'Tectone', name: 'Tectone', keywords: ['zzz', 'zenless'] },
        { type: 'youtube', channelId: 'UCwx3EmL0cr25hXGns68BAJQ', handle: 'VarsII', name: 'Vars II', keywords: ['zzz', 'zenless'] },
      ],
    },
    sections: [
      { id: 'news', label: 'Latest News', icon: 'newspaper' },
      { id: 'patch_notes', label: 'Patch Notes', icon: 'document' },
      { id: 'tier_list', label: 'Tier Lists', icon: 'chart-bar' },
      { id: 'guides', label: 'Guides & Builds', icon: 'book-open' },
      { id: 'community_official', label: 'Official Posts', icon: 'megaphone' },
      { id: 'community_reddit', label: 'Reddit & Forums', icon: 'chat-bubble-left-right' },
      { id: 'videos', label: 'Latest Videos', icon: 'play' },
    ],
  },
  {
    id: 'arknights-endfield',
    name: 'Arknights: Endfield',
    shortName: 'AKE',
    slug: 'ake',
    accentColor: '#00D4FF',
    gradientFrom: '#0c1929',
    gradientTo: '#1a2332',
    description: 'Open-world strategy RPG by Hypergryph',
    regions: ['global'],
    sources: {
      tier_list: [
        { type: 'prydwen', url: 'https://www.prydwen.gg/arknights-endfield/tier-list' },
      ],
      guides: [
        { type: 'prydwen', url: 'https://www.prydwen.gg/arknights-endfield/guides' },
        { type: 'game8', url: 'https://game8.co/games/Arknights-Endfield' },
      ],
      news: [
        { type: 'gryphline', pageUrl: 'https://endfield.gryphline.com/en/news', lang: 'en' },
      ],
      patch_notes: [
        { type: 'gryphline', pageUrl: 'https://endfield.gryphline.com/en/news', lang: 'en', filter: 'patch_notes' },
      ],
      community_reddit: [
        { type: 'reddit', subreddit: 'ArknightsEndfield' },
      ],
      videos: [
        { type: 'youtube', channelId: 'UCowPaVRBzg8CE6K4CB6LJfw', handle: 'arknightsendfieldEN', name: 'Arknights Endfield Official' },
        { type: 'youtube', channelId: 'UCPnSoX7NkOBcOX0Gfw_yjAw', handle: 'Tectone', name: 'Tectone', keywords: ['endfield'] },
      ],
    },
    sections: [
      { id: 'news', label: 'Latest News', icon: 'newspaper' },
      { id: 'patch_notes', label: 'Patch Notes', icon: 'document' },
      { id: 'tier_list', label: 'Tier Lists', icon: 'chart-bar' },
      { id: 'guides', label: 'Guides & Builds', icon: 'book-open' },
      { id: 'community_reddit', label: 'Reddit & Forums', icon: 'chat-bubble-left-right' },
      { id: 'videos', label: 'Latest Videos', icon: 'play' },
    ],
  },
];

function getGame(gameId) {
  return games.find(g => g.id === gameId) || null;
}

function getAllGames() {
  return games;
}

module.exports = { games, getGame, getAllGames };
