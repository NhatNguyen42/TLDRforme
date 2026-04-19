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
    const { channelId, name, handle } = sourceConfig;
    this.log(`Fetching YouTube videos for channel: ${name || channelId}`);

    // Try RSS feed first (with retry), then fall back to page scraping
    let articles = await this.tryRSS(sourceConfig);
    if (articles.length === 0 && (handle || channelId)) {
      this.log('RSS returned no results, falling back to page scraping');
      articles = await this.scrapePage(sourceConfig);
    }
    return articles;
  }

  async tryRSS(sourceConfig) {
    const { channelId, name } = sourceConfig;
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.client.get(feedUrl);
        const parsed = this.parser.parse(response.data);
        const entries = parsed?.feed?.entry;
        if (!entries) {
          this.log('RSS feed returned no entries');
          return [];
        }

        const items = Array.isArray(entries) ? entries : [entries];
        return this.filterAndMap(items, sourceConfig, (entry) => ({
          title: entry.title || 'Untitled Video',
          videoId: entry['yt:videoId'],
          author: entry.author?.name || name || 'YouTube',
          publishedAt: entry.published ? new Date(entry.published) : null,
        }));
      } catch (err) {
        this.error(`RSS attempt ${attempt} failed (${err.response?.status || err.message})`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
      }
    }
    return [];
  }

  async scrapePage(sourceConfig) {
    const { channelId, name, handle } = sourceConfig;
    const pageUrl = handle
      ? `https://www.youtube.com/@${handle}/videos`
      : `https://www.youtube.com/channel/${channelId}/videos`;

    try {
      const response = await this.client.get(pageUrl);
      const html = typeof response.data === 'string' ? response.data : '';
      const match = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/);
      if (!match) {
        this.log('Could not find ytInitialData in page');
        return [];
      }

      const data = JSON.parse(match[1]);
      const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      const videosTab = tabs.find(t =>
        t?.tabRenderer?.title === 'Videos' ||
        t?.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/videos')
      );

      const contents = videosTab?.tabRenderer?.content
        ?.richGridRenderer?.contents || [];

      const items = contents
        .map(c => c?.richItemRenderer?.content?.videoRenderer)
        .filter(Boolean);

      if (items.length === 0) {
        this.log('No videos found on channel page');
        return [];
      }

      const channelName = data?.metadata?.channelMetadataRenderer?.title || name || 'YouTube';

      return this.filterAndMap(items, sourceConfig, (vid) => {
        const publishText = vid.publishedTimeText?.simpleText || '';
        return {
          title: vid.title?.runs?.[0]?.text || vid.title?.simpleText || 'Untitled Video',
          videoId: vid.videoId,
          author: channelName,
          publishedAt: this.parseRelativeDate(publishText),
        };
      });
    } catch (err) {
      this.error('Page scraping failed', err);
      return [];
    }
  }

  filterAndMap(items, sourceConfig, extractor) {
    const keywords = sourceConfig.keywords;
    const mapped = items.map(extractor);

    const filtered = keywords
      ? mapped.filter(v => {
          const title = (v.title || '').toLowerCase();
          return keywords.some(k => title.includes(k.toLowerCase()));
        })
      : mapped;

    return filtered.slice(0, 15).map(v => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      imageUrl: v.videoId
        ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
        : null,
      author: v.author,
      region: null,
      publishedAt: v.publishedAt,
    }));
  }

  parseRelativeDate(text) {
    if (!text) return null;
    const now = new Date();
    const match = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const ms = { second: 1000, minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 };
    return new Date(now.getTime() - num * (ms[unit] || 0));
  }
}

module.exports = new YoutubeScraper();
