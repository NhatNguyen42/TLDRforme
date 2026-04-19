const { PrismaClient } = require('@prisma/client');
const { getAllGames, getGame } = require('../config/games');
const prydwenScraper = require('../scrapers/prydwen');
const game8Scraper = require('../scrapers/game8');
const hoyolabScraper = require('../scrapers/hoyolab');
const hoyolabWebScraper = require('../scrapers/hoyolabWeb');
const redditScraper = require('../scrapers/reddit');
const patchNotesScraper = require('../scrapers/patchNotes');
const youtubeScraper = require('../scrapers/youtube');
const officialScraper = require('../scrapers/official');
const gryphlineScraper = require('../scrapers/gryphline');
const { summarize, translate, generatePulse } = require('./grok');

const prisma = new PrismaClient();

const scraperMap = {
  prydwen: prydwenScraper,
  game8: game8Scraper,
  hoyolab: hoyolabScraper,
  'hoyolab-web': hoyolabWebScraper,
  reddit: redditScraper,
  'patch-notes': patchNotesScraper,
  youtube: youtubeScraper,
  official: officialScraper,
  gryphline: gryphlineScraper,
};

// Small delay to avoid hammering sites
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeGame(gameId) {
  const game = getGame(gameId);
  if (!game) {
    console.error(`[ScrapeManager] Game not found: ${gameId}`);
    return { game: gameId, error: 'Game not found' };
  }

  console.log(`[ScrapeManager] Starting scrape for ${game.name}`);
  const results = { game: game.name, sections: {}, errors: [] };

  for (const [category, sources] of Object.entries(game.sources)) {
    const sourceList = Array.isArray(sources) ? sources : [sources];
    const categoryArticles = [];

    for (const source of sourceList) {
      const scraper = scraperMap[source.type];
      if (!scraper) {
        console.warn(`[ScrapeManager] No scraper for type: ${source.type}`);
        continue;
      }

      const start = Date.now();
      try {
        let articles = await scraper.scrape(source, game);

        // Translate CN content if needed
        if (source.region === 'cn' || source.type === 'bilibili') {
          articles = await translateArticles(articles);
        }

        // Store in database
        let stored = 0;
        for (const article of articles) {
          try {
            await prisma.article.upsert({
              where: { url_gameId_category: { url: article.url, gameId: game.id, category } },
              create: {
                gameId: game.id,
                source: source.type,
                category,
                title: article.title,
                summary: article.summary || null,
                url: article.url,
                imageUrl: article.imageUrl || null,
                author: article.author || null,
                region: article.region || source.region || null,
                publishedAt: article.publishedAt || null,
              },
              update: {
                title: article.title,
                summary: article.summary || undefined,
                imageUrl: article.imageUrl || undefined,
                updatedAt: new Date(),
              },
            });
            stored++;
          } catch (dbErr) {
            // Skip duplicates or DB errors silently
          }
        }

        categoryArticles.push(...articles);

        const duration = Date.now() - start;
        await prisma.scrapeLog.create({
          data: {
            gameId: game.id,
            source: source.type,
            status: 'success',
            count: stored,
            duration,
          },
        });

        console.log(
          `[ScrapeManager] ${source.type} → ${stored} articles stored (${duration}ms)`,
        );
      } catch (err) {
        const duration = Date.now() - start;
        results.errors.push({ source: source.type, error: err.message });
        await prisma.scrapeLog.create({
          data: {
            gameId: game.id,
            source: source.type,
            status: 'error',
            message: err.message,
            duration,
          },
        });
        console.error(
          `[ScrapeManager] ${source.type} failed: ${err.message}`,
        );
      }

      // Rate-limit between sources
      await delay(1500);
    }

    results.sections[category] = categoryArticles.length;
  }

  // Generate community pulse summary with Grok
  try {
    const recentArticles = await prisma.article.findMany({
      where: { gameId: game.id },
      orderBy: { scrapedAt: 'desc' },
      take: 15,
    });
    const pulse = await generatePulse(recentArticles, game.name);
    // Store pulse in community_official if it exists, otherwise community_reddit
    const pulseCategory = game.sections.some(s => s.id === 'community_official')
      ? 'community_official'
      : 'community_reddit';
    if (pulse) {
      await prisma.article.upsert({
        where: { url_gameId_category: { url: `pulse://${game.id}`, gameId: game.id, category: pulseCategory } },
        create: {
          gameId: game.id,
          source: 'grok',
          category: pulseCategory,
          title: `Community Pulse — ${game.name}`,
          summary: pulse,
          url: `pulse://${game.id}`,
          author: 'AI Summary',
        },
        update: {
          summary: pulse,
          updatedAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error(`[ScrapeManager] Pulse generation failed:`, err.message);
  }

  console.log(`[ScrapeManager] Finished scrape for ${game.name}`);
  return results;
}

async function translateArticles(articles) {
  const translated = [];
  for (const article of articles) {
    try {
      const translatedTitle = await translate(article.title);
      translated.push({
        ...article,
        title: translatedTitle || article.title,
        summary: article.summary || null,
      });
      // Rate-limit Grok calls
      await delay(500);
    } catch {
      translated.push(article);
    }
  }
  return translated;
}

async function scrapeAll() {
  const games = getAllGames();
  const results = [];
  for (const game of games) {
    const result = await scrapeGame(game.id);
    results.push(result);
    // Delay between games
    await delay(3000);
  }
  return results;
}

module.exports = { scrapeGame, scrapeAll };
