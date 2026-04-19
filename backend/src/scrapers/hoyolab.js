const BaseScraper = require('./baseScraper');

class HoyolabScraper extends BaseScraper {
  constructor() {
    super('HoYoLAB');
    this.baseUrl = 'https://bbs-api-os.hoyolab.com/community/post/wapi';
  }

  async scrape(sourceConfig, _gameConfig) {
    const { gids, menuId, forumId } = sourceConfig;
    this.log(`Fetching HoYoLAB content for gids=${gids}`);

    try {
      const articles = [];

      // Fetch official news
      if (menuId) {
        const news = await this.fetchNews(gids, menuId);
        articles.push(...news);
      }

      // Fetch community hot posts
      if (forumId) {
        const posts = await this.fetchHotPosts(forumId);
        articles.push(...posts);
      }

      return articles;
    } catch (err) {
      this.error('Failed to scrape', err);
      return [];
    }
  }

  async fetchNews(gids, menuId) {
    try {
      const url = `${this.baseUrl}/getNewsList?gids=${gids}&page_size=15&type=1`;
      const data = await this.fetchJSON(url, {
        Referer: 'https://www.hoyolab.com/',
        Origin: 'https://www.hoyolab.com',
      });

      if (data.retcode !== 0 || !data.data?.list) {
        this.log('News API returned no data');
        return [];
      }

      return data.data.list.map(post => ({
        title: post.post?.subject || 'Untitled',
        url: `https://www.hoyolab.com/article/${post.post?.post_id}`,
        imageUrl:
          post.image_list?.[0]?.url ||
          post.post?.cover ||
          null,
        author: post.user?.nickname || 'HoYoLAB',
        region: 'global',
        publishedAt: post.post?.created_at
          ? new Date(post.post.created_at * 1000)
          : null,
      }));
    } catch (err) {
      this.error('Failed to fetch news', err);
      return [];
    }
  }

  async fetchHotPosts(forumId) {
    try {
      const url = `${this.baseUrl}/getForumPostList?forum_id=${forumId}&sort_type=2&page_size=15`;
      const data = await this.fetchJSON(url, {
        Referer: 'https://www.hoyolab.com/',
        Origin: 'https://www.hoyolab.com',
      });

      if (data.retcode !== 0 || !data.data?.list) {
        this.log('Community API returned no data');
        return [];
      }

      return data.data.list.map(item => ({
        title: item.post?.subject || 'Untitled',
        url: `https://www.hoyolab.com/article/${item.post?.post_id}`,
        imageUrl:
          item.image_list?.[0]?.url ||
          item.post?.cover ||
          null,
        author: item.user?.nickname || 'Community',
        region: 'global',
        publishedAt: item.post?.created_at
          ? new Date(item.post.created_at * 1000)
          : null,
      }));
    } catch (err) {
      this.error('Failed to fetch hot posts', err);
      return [];
    }
  }
}

module.exports = new HoyolabScraper();
