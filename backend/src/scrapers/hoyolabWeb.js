const BaseScraper = require('./baseScraper');

class HoyolabWebScraper extends BaseScraper {
  constructor() {
    super('HoYoLAB-Web');
  }

  async scrape(sourceConfig, _gameConfig) {
    const { gids } = sourceConfig;
    this.log(`Fetching HoYoLAB community posts for gids=${gids}`);

    try {
      const articles = [];

      // Use the news API with type=3 (community/fan content) and type=2 (events/community)
      for (const type of [3, 2]) {
        const url = `https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList?gids=${gids}&page_size=10&type=${type}`;
        const data = await this.fetchJSON(url, {
          Referer: 'https://www.hoyolab.com/',
          Origin: 'https://www.hoyolab.com',
          'x-rpc-language': 'en-us',
        });

        if (data.retcode !== 0 || !data.data?.list) {
          this.log(`News type=${type} returned no data`);
          continue;
        }

        this.log(`News type=${type} returned ${data.data.list.length} posts`);

        for (const item of data.data.list) {
          const post = item.post || {};
          articles.push({
            title: post.subject || 'Untitled',
            url: `https://www.hoyolab.com/article/${post.post_id}`,
            imageUrl:
              item.image_list?.[0]?.url ||
              post.cover ||
              null,
            author: item.user?.nickname || 'Community',
            region: 'global',
            publishedAt: post.created_at
              ? new Date(post.created_at * 1000)
              : null,
          });
        }
      }

      return articles;
    } catch (err) {
      this.error('Failed to fetch community posts', err);
      return [];
    }
  }
}

module.exports = new HoyolabWebScraper();
