const BaseScraper = require('./baseScraper');

class PrydwenScraper extends BaseScraper {
  constructor() {
    super('Prydwen');
  }

  async scrape(sourceConfig, gameConfig) {
    const url = sourceConfig.url;
    this.log(`Scraping ${url}`);

    try {
      const $ = await this.fetchPage(url);
      const articles = [];

      if (url.includes('tier-list')) {
        return this.scrapeTierList($, url, gameConfig);
      }

      if (url.includes('guide')) {
        return this.scrapeGuides($, url, gameConfig);
      }

      // Generic article scraping fallback — use alt attributes for titles
      $('a[href]').each((_i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (!href) return;

        // Get title from alt attribute or clean text
        let title = null;
        const $img = $el.find('img[alt]').first();
        if ($img.length) {
          title = $img.attr('alt');
        }
        if (!title) {
          const clone = $el.clone();
          clone.find('script, noscript, style').remove();
          title = clone.text().replace(/const t=.*?\}\}/g, '').trim();
        }

        if (title && title.length > 5 && title.length < 200) {
          const fullUrl = href.startsWith('http')
            ? href
            : `https://www.prydwen.gg${href}`;

          let imgSrc = null;
          $el.find('img').each((_j, imgEl) => {
            const src = $(imgEl).attr('data-src') || $(imgEl).attr('src') || '';
            if (!imgSrc && !src.startsWith('data:') && src.length > 0) {
              imgSrc = src.startsWith('http') ? src : `https://www.prydwen.gg${src}`;
            }
          });

          articles.push({
            title,
            url: fullUrl,
            imageUrl: imgSrc,
            author: 'Prydwen.gg',
            region: null,
            publishedAt: null,
          });
        }
      });

      return this.deduplicateByUrl(articles).slice(0, 20);
    } catch (err) {
      this.error('Failed to scrape', err);
      return [];
    }
  }

  scrapeTierList($, pageUrl, _gameConfig) {
    const articles = [];

    // Build structured tier data from the page
    const tierData = { tiers: [], roles: [], url: pageUrl };

    // Extract role headers (e.g. "Crit DPS | Anomaly DPS | Support")
    const headerText = $('.custom-tier-header').text().trim();
    if (headerText) {
      tierData.roles = headerText.split(/\s{2,}/).map(r => r.trim()).filter(Boolean);
    }

    // Extract each tier row
    $('.custom-tier').each((_i, tierEl) => {
      const $tier = $(tierEl);
      const ratingText = $tier.find('.tier-rating').first().text().trim();
      if (!ratingText) return;

      const tierRow = { label: ratingText, characters: [] };

      // Get characters grouped by role (burst class)
      $tier.find('.custom-tier-burst').each((_j, burstEl) => {
        const burstClass = $(burstEl).attr('class') || '';
        // Extract role from class: "custom-tier-burst dps" -> "dps"
        const roleMatch = burstClass.replace('custom-tier-burst', '').trim();

        $(burstEl).find('a[href*="/characters/"]').each((_k, charEl) => {
          const href = $(charEl).attr('href');
          if (!href) return;

          const $imgs = $(charEl).find('img[alt]');
          let charName = null;
          let imgSrc = null;

          $imgs.each((_l, imgEl) => {
            const alt = $(imgEl).attr('alt') || '';
            const src = $(imgEl).attr('data-src') || $(imgEl).attr('src') || '';
            const isElementIcon = /^(fire|ice|electric|ether|physical|wind|imaginary|quantum|honest)$/i.test(alt);
            const isSvgPlaceholder = src.startsWith('data:image/svg');

            if (!charName && alt.length > 1 && !isElementIcon) {
              charName = alt;
            }
            if (!imgSrc && !isSvgPlaceholder && src.length > 0 && !isElementIcon) {
              imgSrc = src;
            }
          });

          if (!charName) {
            const slug = href.split('/characters/')[1];
            if (slug) charName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          }
          if (!charName) return;

          if (imgSrc && !imgSrc.startsWith('http')) {
            imgSrc = `https://www.prydwen.gg${imgSrc}`;
          }

          const fullUrl = href.startsWith('http') ? href : `https://www.prydwen.gg${href}`;

          tierRow.characters.push({
            name: charName,
            url: fullUrl,
            imageUrl: imgSrc,
            role: roleMatch || null,
          });
        });
      });

      if (tierRow.characters.length > 0) {
        tierData.tiers.push(tierRow);
      }
    });

    // Store as a single article with tier chart JSON in summary
    articles.push({
      title: 'Character Tier List — Prydwen.gg',
      url: pageUrl,
      imageUrl: null,
      author: 'Prydwen.gg',
      region: null,
      publishedAt: new Date(),
      summary: JSON.stringify(tierData),
    });

    return articles;
  }

  scrapeGuides($, pageUrl, _gameConfig) {
    const articles = [];

    // Prydwen guide links use Gatsby SSR too — same approach
    const guideSelectors = [
      'a[href*="/guide"]',
      'a[href*="/build"]',
      'a[href*="/team"]',
      'a[href*="/tools/"]',
    ];

    for (const selector of guideSelectors) {
      $(selector).each((_i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        if (!href) return;

        // Get name from alt attribute of images, or from clean text
        let title = null;

        // Try alt attributes first
        const $img = $el.find('img[alt]').first();
        if ($img.length) {
          const alt = $img.attr('alt');
          if (alt && alt.length > 2) title = alt;
        }

        // Fallback: extract text but strip HTML tags and scripts
        if (!title) {
          // Remove script tags and their content, then get text
          const clone = $el.clone();
          clone.find('script, noscript, style').remove();
          title = clone.text().replace(/const t=.*?\}\}/g, '').trim();
        }

        // Final fallback: derive from URL
        if (!title || title.length < 3) {
          const slug = href.split('/').pop();
          if (slug) {
            title = slug
              .replace(/-/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());
          }
        }

        if (!title || title.length < 3) return;

        // Get image
        let imgSrc = null;
        $el.find('img').each((_j, imgEl) => {
          const src = $(imgEl).attr('data-src') || $(imgEl).attr('src') || '';
          if (!imgSrc && !src.startsWith('data:') && src.length > 0) {
            imgSrc = src.startsWith('http') ? src : `https://www.prydwen.gg${src}`;
          }
        });

        const fullUrl = href.startsWith('http')
          ? href
          : `https://www.prydwen.gg${href}`;

        articles.push({
          title,
          url: fullUrl,
          imageUrl: imgSrc,
          author: 'Prydwen.gg',
          region: null,
          publishedAt: null,
        });
      });
    }

    return this.deduplicateByUrl(articles).slice(0, 25);
  }

  deduplicateByUrl(articles) {
    const seen = new Set();
    return articles.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });
  }
}

module.exports = new PrydwenScraper();
