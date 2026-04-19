export async function fetchGames() {
  const res = await fetch(`/api/games`);
  if (!res.ok) throw new Error('Failed to fetch games');
  return res.json();
}

export async function fetchGameFeed(gameId) {
  const res = await fetch(
    `/api/games/${encodeURIComponent(gameId)}/feed`,
  );
  if (!res.ok) throw new Error('Failed to fetch game feed');
  return res.json();
}

export async function fetchCategory(gameId, category) {
  const res = await fetch(
    `/api/games/${encodeURIComponent(gameId)}/${encodeURIComponent(category)}`,
  );
  if (!res.ok) throw new Error('Failed to fetch category');
  return res.json();
}

export async function triggerScrape(adminKey, gameId = null) {
  const url = gameId
    ? `/api/scrape/${encodeURIComponent(gameId)}`
    : `/api/scrape`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
    },
  });
  if (!res.ok) throw new Error('Scrape trigger failed');
  return res.json();
}
