const cron = require('node-cron');
const { scrapeAll } = require('../services/scrapeManager');

let isRunning = false;

function startScheduler() {
  // Scrape every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    if (isRunning) {
      console.log('[Scheduler] Scrape already in progress, skipping');
      return;
    }

    console.log('[Scheduler] Starting scheduled scrape...');
    isRunning = true;

    try {
      const results = await scrapeAll();
      console.log('[Scheduler] Scrape completed:', JSON.stringify(results.map(r => ({
        game: r.game,
        sections: r.sections,
        errors: r.errors?.length || 0,
      }))));
    } catch (err) {
      console.error('[Scheduler] Scrape failed:', err.message);
    } finally {
      isRunning = false;
    }
  });

  console.log('[Scheduler] Cron job scheduled — scraping every 12 hours');

  // Run initial scrape 10 seconds after startup
  setTimeout(async () => {
    if (isRunning) return;
    console.log('[Scheduler] Running initial scrape...');
    isRunning = true;
    try {
      await scrapeAll();
    } catch (err) {
      console.error('[Scheduler] Initial scrape failed:', err.message);
    } finally {
      isRunning = false;
    }
  }, 10000);
}

module.exports = { startScheduler };
