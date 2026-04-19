const BaseScraper = require('./baseScraper');

const PATCH_KEYWORDS = /version|update|patch|maintenance|hotfix|known\s*issues|pre-download|changelog|new\s*stock|city\s*fund|special\s*program/i;

class PatchNotesScraper extends BaseScraper {
  constructor() {
    super('PatchNotes');
  }

  async scrape(sourceConfig, _gameConfig) {
    const { method } = sourceConfig;

    switch (method) {
      case 'hoyolab':
        return this.scrapeHoyolab(sourceConfig);
      case 'prydwen-blog':
        return this.scrapePrydwenBlog(sourceConfig);
      case 'reddit':
        return this.scrapeRedditPatches(sourceConfig);
      default:
        this.log(`Unknown method: ${method}`);
        return [];
    }
  }

  async scrapeHoyolab({ gids }) {
    this.log(`Fetching HoYoLAB patch notes for gids=${gids}`);
    try {
      const url = `https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList?gids=${gids}&page_size=30&type=1`;
      const data = await this.fetchJSON(url, {
        Referer: 'https://www.hoyolab.com/',
        Origin: 'https://www.hoyolab.com',
        'x-rpc-language': 'en-us',
      });

      if (data.retcode !== 0 || !data.data?.list) {
        this.log('API returned no data');
        return [];
      }

      const filtered = data.data.list.filter(item => {
        const title = item.post?.subject || '';
        return PATCH_KEYWORDS.test(title);
      });

      this.log(`Found ${filtered.length} patch-related posts out of ${data.data.list.length}`);

      return filtered.map(item => ({
        title: item.post?.subject || 'Untitled',
        url: `https://www.hoyolab.com/article/${item.post?.post_id}`,
        imageUrl: item.image_list?.[0]?.url || item.post?.cover || null,
        author: item.user?.nickname || 'Official',
        region: 'global',
        publishedAt: item.post?.created_at
          ? new Date(item.post.created_at * 1000)
          : null,
      }));
    } catch (err) {
      this.error('Failed to fetch HoYoLAB patch notes', err);
      return [];
    }
  }

  async scrapePrydwenBlog({ blogUrl, gameFilter }) {
    this.log(`Scraping Prydwen blog: ${blogUrl}`);
    try {
      const $ = await this.fetchPage(blogUrl);
      const articles = [];

      // Prydwen blog uses article elements or post containers
      $('article').each((_, el) => {
        const $el = $(el);
        const $link = $el.find('a').first();
        const title = $el.find('h2, h3, .post-title').first().text().trim()
          || $link.text().trim();
        let href = $link.attr('href') || '';

        if (!title || title.length < 5) return;
        // Filter to only game-relevant posts if filter provided
        if (gameFilter && !title.toLowerCase().includes(gameFilter.toLowerCase())) return;

        if (href && !href.startsWith('http')) {
          href = `https://blog.prydwen.gg${href}`;
        }

        const img = $el.find('img').first();
        let imageUrl = img.attr('data-src') || img.attr('src') || null;
        if (imageUrl && imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;

        articles.push({
          title,
          url: href,
          imageUrl,
          author: 'Prydwen',
          region: 'global',
          publishedAt: null,
        });
      });

      this.log(`Found ${articles.length} blog posts`);
      return articles;
    } catch (err) {
      this.error('Failed to scrape Prydwen blog', err);
      return [];
    }
  }

  async scrapeRedditPatches({ subreddit }) {
    this.log(`Fetching patch-related posts from r/${subreddit}`);
    try {
      // Search Reddit for patch/update posts
      const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=flair%3Aofficial+OR+update+OR+patch+OR+maintenance&sort=new&restrict_sr=on&limit=10`;
      const response = await this.client.get(url, {
        headers: { Accept: 'application/json' },
      });

      const posts = response.data?.data?.children || [];
      const filtered = posts.filter(p => {
        const title = p.data?.title || '';
        return PATCH_KEYWORDS.test(title);
      });

      this.log(`Found ${filtered.length} patch-related posts`);

      return filtered.map(p => {
        const d = p.data;
        let imageUrl = null;
        if (d.thumbnail && d.thumbnail.startsWith('http')) imageUrl = d.thumbnail;
        if (d.preview?.images?.[0]?.source?.url) {
          imageUrl = d.preview.images[0].source.url.replace(/&amp;/g, '&');
        }
        return {
          title: d.title,
          url: `https://www.reddit.com${d.permalink}`,
          imageUrl,
          author: d.author || 'Reddit',
          region: 'global',
          publishedAt: d.created_utc ? new Date(d.created_utc * 1000) : null,
        };
      });
    } catch (err) {
      this.error(`Failed to fetch patches from r/${subreddit}`, err);
      return [];
    }
  }
}

module.exports = new PatchNotesScraper();
