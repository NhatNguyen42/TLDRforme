const BaseScraper = require('./baseScraper');

class Game8Scraper extends BaseScraper {
  constructor() {
    super('Game8');
  }

  async scrape(sourceConfig, _gameConfig) {
    const url = sourceConfig.url;
    this.log(`Scraping ${url}`);

    try {
      const $ = await this.fetchPage(url);
      const articles = [];
      const gameSlug = this.extractGameSlug(url);

      // Game8 uses a.a-link inside li.a-cardLinkListItem for content cards
      // Images are lazy-loaded with data-src and descriptive alt text
      $('li.a-cardLinkListItem a.a-link, a.a-link').each((_i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (!href || !href.includes(gameSlug)) return;

        const $img = $el.find('img');
        const title =
          $img.attr('alt')?.replace(/^WWM\s+/i, '').trim() ||
          $el.text().trim();
        const imgSrc = $img.attr('data-src') || $img.attr('src') || null;
        // Skip placeholder images
        const imageUrl = imgSrc && !imgSrc.startsWith('data:') ? imgSrc : null;

        if (title && title.length > 3) {
          const fullUrl = href.startsWith('http')
            ? href
            : `https://game8.co${href}`;
          articles.push({
            title: title.replace(/\n/g, ' ').trim(),
            url: fullUrl,
            imageUrl,
            author: 'Game8',
            region: null,
            publishedAt: null,
          });
        }
      });

      // Also grab text-only links from table cells (tier list pages)
      $('td a[href*="' + gameSlug + '"]').each((_i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        const $img = $el.find('img');
        const title =
          $img.attr('alt')?.trim() ||
          $el.text().trim();
        const imgSrc = $img.attr('data-src') || $img.attr('src') || null;
        const imageUrl = imgSrc && !imgSrc.startsWith('data:') ? imgSrc : null;

        if (title && title.length > 3 && href) {
          articles.push({
            title: title.replace(/\n/g, ' ').trim(),
            url: href.startsWith('http') ? href : `https://game8.co${href}`,
            imageUrl,
            author: 'Game8',
            region: null,
            publishedAt: null,
          });
        }
      });

      return this.deduplicateByUrl(articles).slice(0, 30);
    } catch (err) {
      this.error('Failed to scrape', err);
      return [];
    }
  }

  deduplicateByUrl(articles) {
    const seen = new Set();
    return articles.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });
  }

  extractGameSlug(url) {
    const match = url.match(/\/games\/([^/]+)/);
    return match ? match[1] : '';
  }
}

module.exports = new Game8Scraper();
