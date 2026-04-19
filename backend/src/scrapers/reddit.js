const BaseScraper = require('./baseScraper');

class RedditScraper extends BaseScraper {
  constructor() {
    super('Reddit');
  }

  async scrape(sourceConfig, _gameConfig) {
    const { subreddit } = sourceConfig;
    this.log(`Fetching hot posts from r/${subreddit}`);

    try {
      const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=15`;
      const response = await this.client.get(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const posts = response.data?.data?.children || [];
      if (posts.length === 0) {
        this.log('No posts found');
        return [];
      }

      this.log(`Found ${posts.length} posts`);

      return posts
        .filter(p => !p.data.stickied) // skip pinned/megathreads
        .map(p => {
          const d = p.data;
          // Pick a thumbnail — Reddit provides various image sources
          let imageUrl = null;
          if (d.thumbnail && d.thumbnail.startsWith('http')) {
            imageUrl = d.thumbnail;
          }
          if (d.preview?.images?.[0]?.source?.url) {
            imageUrl = d.preview.images[0].source.url.replace(/&amp;/g, '&');
          }

          return {
            title: d.title,
            url: `https://www.reddit.com${d.permalink}`,
            imageUrl,
            author: d.author || 'Reddit',
            region: 'global',
            publishedAt: d.created_utc
              ? new Date(d.created_utc * 1000)
              : null,
          };
        });
    } catch (err) {
      this.error(`Failed to fetch r/${subreddit}`, err);
      return [];
    }
  }
}

module.exports = new RedditScraper();
