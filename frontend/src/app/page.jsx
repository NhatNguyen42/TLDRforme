import Header from '../components/Header';
import GameSection from '../components/GameSection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getGames() {
  try {
    const res = await fetch(`${API_URL}/api/games`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.games || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const games = await getGames();

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Header games={games} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        {games.length > 0 ? (
          games.map((game) => <GameSection key={game.id} game={game} />)
        ) : (
          <EmptyState />
        )}
      </div>

      <Footer />
      <ScrollToTop />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-2">
        No Games Configured
      </h2>
      <p className="text-gray-500 max-w-md">
        The backend hasn&apos;t been connected yet. Make sure it&apos;s running
        and the API URL is configured correctly.
      </p>
    </div>
  );
}
