const BaseScraper = require('./baseScraper');

class OfficialScraper extends BaseScraper {
  constructor() {
    super('Official');
  }

  async scrape(sourceConfig, gameConfig) {
    const { url, region } = sourceConfig;
    this.log(`Scraping official site: ${url}`);

    try {
      const $ = await this.fetchPage(url);
      const articles = [];

      // Generic news page scraping — look for article/news links
      const newsSelectors = [
        'article a',
        '.news-item a',
        '.news-card a',
        '.post-item a',
        '[class*="news"] a',
        '[class*="article"] a',
        '[class*="post"] a',
        '.list-item a',
        'a[href*="/news/"]',
        'a[href*="/article/"]',
        'a[href*="/post/"]',
      ];

      const seen = new Set();

      for (const selector of newsSelectors) {
        $(selector).each((_i, el) => {
          const $el = $(el);
          const href = $el.attr('href');
          if (!href || seen.has(href)) return;

          const title =
            $el.attr('title') ||
            $el.find('h2, h3, h4, .title, span').first().text().trim() ||
            $el.text().trim();

          if (!title || title.length < 5 || title.length > 300) return;

          const img =
            $el.find('img').attr('src') ||
            $el.find('img').attr('data-src') ||
            null;

          const fullUrl = href.startsWith('http')
            ? href
            : new URL(href, url).toString();

          seen.add(href);
          articles.push({
            title: title.replace(/\s+/g, ' ').trim(),
            url: fullUrl,
            imageUrl: img,
            author: gameConfig.name,
            region: region || null,
            publishedAt: null,
          });
        });
      }

      // Also look for date-containing elements near each article
      return articles.slice(0, 20);
    } catch (err) {
      this.error('Failed to scrape official site', err);
      return [];
    }
  }
}

module.exports = new OfficialScraper();
