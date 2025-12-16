// client/src/pages/SharedDeckPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedDeck } from '../services/api';
import NavBar from '../components/NavBar';
import DeckCard from '../components/DeckCard';
import styles from '../styles/SocialPage.module.css';

interface SharedDeck {
  id: number;
  name: string;
  description: string;
  avgElixir: number;
  slot: number;
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

function SharedDeckPage() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<SharedDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  async function loadDeck() {
    try {
      setLoading(true);
      const data = await getSharedDeck(Number(deckId));
      setDeck(data);
    } catch (err: any) {
      console.error('Error loading deck:', err);
      setError('Deck not found or is private');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.socialContainer}>
          <div className={styles.loadingContainer}>
            Loading deck...
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className={styles.page}>
        <div className={styles.socialContainer}>
          <div className={styles.titleBar}>
            <h1 className={styles.title}>Shared Deck</h1>
          </div>
          <div className={styles.content}>
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>❌</span>
              <h2>{error || 'Deck not found'}</h2>
              <p>This deck may be private or doesn't exist</p>
            </div>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.socialContainer}>
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <h1 className={styles.title}>Shared Deck</h1>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.deckGrid}>
            <DeckCard deck={deck} />
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

export default SharedDeckPage;