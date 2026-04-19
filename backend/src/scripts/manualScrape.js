require('dotenv').config();
const { scrapeAll, scrapeGame } = require('../services/scrapeManager');

async function main() {
  const gameId = process.argv[2];

  if (gameId) {
    console.log(`Manual scrape for game: ${gameId}`);
    const result = await scrapeGame(gameId);
    console.log('Result:', JSON.stringify(result, null, 2));
  } else {
    console.log('Manual scrape for all games');
    const results = await scrapeAll();
    console.log('Results:', JSON.stringify(results, null, 2));
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Manual scrape failed:', err);
  process.exit(1);
});
