const BaseScraper = require('./baseScraper');

const PATCH_KEYWORDS = /version\s*update|maintenance|patch|hotfix|known\s*issues|pre-download|changelog/i;

class GryphlineScraper extends BaseScraper {
  constructor() {
    super('Gryphline');
  }

  async scrape(sourceConfig, _gameConfig) {
    const { pageUrl, lang = 'en', filter } = sourceConfig;
    this.log(`Fetching Gryphline news from ${pageUrl}`);

    try {
      const response = await this.client.get(pageUrl, { timeout: 15000 });
      const html = response.data;

      // Extract Next.js RSC flight data payloads
      const flightRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
      let match;
      let fullPayload = '';
      while ((match = flightRegex.exec(html)) !== null) {
        fullPayload += match[1];
      }

      if (!fullPayload) {
        this.log('No flight data found in page');
        return [];
      }

      // Unescape the JSON-encoded flight data
      const unescaped = fullPayload.replace(/\\"/g, '"').replace(/\\\//g, '/');

      // Find the bulletins array using regex to extract individual objects
      const bulletinRegex = /\{"cid":"([^"]+)","tab":"([^"]+)","sticky":(true|false),"title":"([^"]*?)","author":"([^"]*?)","displayTime":(\d+),"cover":"([^"]*?)","extraCover":"[^"]*","brief":"([^"]*?)"\}/g;

      let articles = [];
      let bMatch;
      while ((bMatch = bulletinRegex.exec(unescaped)) !== null) {
        const [, cid, tab, , title, author, displayTime, cover] = bMatch;
        const cleanTitle = title.replace(/\\u0026/g, '&').replace(/\\n/g, ' ').trim();

        const articleUrl = `https://endfield.gryphline.com/${lang}/news/${cid}`;

        articles.push({
          title: cleanTitle,
          url: articleUrl,
          imageUrl: cover || null,
          author: author || 'Arknights: Endfield',
          region: 'global',
          publishedAt: displayTime ? new Date(Number(displayTime) * 1000) : null,
          tab,
        });
      }

      // Apply filter if specified
      if (filter === 'patch_notes') {
        articles = articles.filter(a => PATCH_KEYWORDS.test(a.title));
      }

      this.log(`Found ${articles.length} bulletins${filter ? ` (filter: ${filter})` : ''}`);
      return articles;
    } catch (err) {
      this.error('Failed to fetch Gryphline news', err);
      return [];
    }
  }
}

module.exports = new GryphlineScraper();
