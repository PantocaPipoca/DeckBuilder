// client/src/pages/SocialPage.tsx
import { useState, useEffect } from 'react';
import { getPublicDecks } from '../services/api';
import NavBar from '../components/NavBar';
import DeckCard from '../components/DeckCard';
import styles from '../styles/SocialPage.module.css';

interface PublicDeck {
  id: number;
  name: string;
  description: string;
  avgElixir: number;
  likes: number;
  owner: {
    id: number;
    name: string;
  };
  cards: Array<{
    position: number;
    card: {
      name: string;
      elixir: number;
      rarity: string;
    };
  }>;
  createdAt: string;
}

function SocialPage() {
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPublicDecks();
  }, []);

  async function loadPublicDecks() {
    try {
      setLoading(true);
      const publicDecks = await getPublicDecks();
      setDecks(publicDecks);
    } catch (err: any) {
      console.error('Error loading public decks:', err);
      setError('Failed to load public decks');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.socialContainer}>
          <div className={styles.loadingContainer}>
            Loading public decks...
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.socialContainer}>
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={loadPublicDecks} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.socialContainer}>
        {/* Title Bar - estilo Clash Royale */}
        <div className={styles.titleBar}>
          <h1 className={styles.title}>Public Decks</h1>
        </div>

        {/* Decks List */}
        <div className={styles.content}>
          {decks.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <h2>No public decks yet</h2>
              <p>Be the first to share a deck!</p>
            </div>
          ) : (
            <div className={styles.deckGrid}>
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

export default SocialPage;