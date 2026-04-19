const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { getAllGames, getGame } = require('../config/games');
const { scrapeGame, scrapeAll } = require('../services/scrapeManager');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/games — list all games with config
router.get('/games', (_req, res) => {
  const games = getAllGames();
  res.json({ games });
});

// GET /api/games/:gameId/feed — all content for a game grouped by category
router.get('/games/:gameId/feed', async (req, res) => {
  const game = getGame(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const articles = await prisma.article.findMany({
    where: { gameId: game.id },
    orderBy: { scrapedAt: 'desc' },
    take: 200,
  });

  // Group by category
  const sections = {};
  for (const section of game.sections) {
    sections[section.id] = articles.filter(a => a.category === section.id);
  }

  // Also include articles categorized differently
  for (const article of articles) {
    if (!sections[article.category]) {
      sections[article.category] = [];
    }
    if (!sections[article.category].find(a => a.id === article.id)) {
      sections[article.category].push(article);
    }
  }

  // Find the community pulse
  const pulse = articles.find(
    a => a.source === 'grok' && a.category.startsWith('community'),
  );

  // Last scrape time
  const lastLog = await prisma.scrapeLog.findFirst({
    where: { gameId: game.id, status: 'success' },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    game,
    sections,
    pulse: pulse?.summary || null,
    lastUpdated: lastLog?.createdAt || null,
  });
});

// GET /api/games/:gameId/:category — articles by category
router.get('/games/:gameId/:category', async (req, res) => {
  const game = getGame(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const articles = await prisma.article.findMany({
    where: {
      gameId: game.id,
      category: req.params.category,
    },
    orderBy: { scrapedAt: 'desc' },
    take: 50,
  });

  res.json({ game: game.name, category: req.params.category, articles });
});

// POST /api/scrape — trigger manual scrape (admin protected)
router.post('/scrape', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Don't await — respond immediately, scrape in background
  scrapeAll().catch(err =>
    console.error('[API] Background scrape failed:', err.message),
  );

  res.json({ message: 'Scrape started for all games', status: 'running' });
});

// POST /api/scrape/:gameId — scrape a specific game
router.post('/scrape/:gameId', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const game = getGame(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  scrapeGame(game.id).catch(err =>
    console.error(`[API] Background scrape for ${game.name} failed:`, err.message),
  );

  res.json({
    message: `Scrape started for ${game.name}`,
    status: 'running',
  });
});

// DELETE /api/admin/articles — delete articles by filter (admin protected)
router.delete('/admin/articles', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { gameId, source, category } = req.query;
  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  const where = { gameId };
  if (source) where.source = source;
  if (category) where.category = category;

  const result = await prisma.article.deleteMany({ where });
  res.json({ deleted: result.count });
});

// GET /api/status — scrape status/logs
router.get('/status', async (_req, res) => {
  const logs = await prisma.scrapeLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json({ logs });
});

module.exports = router;
