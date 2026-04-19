const BaseScraper = require('./baseScraper');
const { XMLParser } = require('fast-xml-parser');

class YoutubeScraper extends BaseScraper {
  constructor() {
    super('YouTube');
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  async scrape(sourceConfig, _gameConfig) {
    const { channelId, name } = sourceConfig;
    this.log(`Fetching YouTube RSS for channel: ${name || channelId}`);

    try {
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
      const response = await this.client.get(feedUrl);
      const parsed = this.parser.parse(response.data);

      const entries = parsed?.feed?.entry;
      if (!entries) {
        this.log('No entries found in RSS feed');
        return [];
      }

      const items = Array.isArray(entries) ? entries : [entries];

      // Filter by keywords if specified (for multi-game channels)
      const keywords = sourceConfig.keywords;
      const filtered = keywords
        ? items.filter(e => {
            const title = (e.title || '').toLowerCase();
            return keywords.some(k => title.includes(k.toLowerCase()));
          })
        : items;

      return filtered.slice(0, 15).map(entry => {
        const videoId = entry['yt:videoId'];
        return {
          title: entry.title || 'Untitled Video',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          imageUrl: videoId
            ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
            : null,
          author: entry.author?.name || name || 'YouTube',
          region: null,
          publishedAt: entry.published ? new Date(entry.published) : null,
        };
      });
    } catch (err) {
      this.error('Failed to fetch RSS feed', err);
      return [];
    }
  }
}

module.exports = new YoutubeScraper();
