const axios = require('axios');
const cheerio = require('cheerio');

class BaseScraper {
  constructor(name) {
    this.name = name;
    this.client = axios.create({
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
  }

  async fetchPage(url) {
    const response = await this.client.get(url);
    return cheerio.load(response.data);
  }

  async fetchJSON(url, headers = {}) {
    const response = await this.client.get(url, { headers });
    return response.data;
  }

  async scrape(_sourceConfig, _gameConfig) {
    throw new Error(`${this.name}: scrape() must be implemented`);
  }

  log(message) {
    console.log(`[${this.name}] ${message}`);
  }

  error(message, err) {
    console.error(`[${this.name}] ${message}`, err?.message || '');
  }
}

module.exports = BaseScraper;
