// client/src/components/DeckCard.tsx
import { useState } from 'react';
import { likeDeck } from '../services/api';
import styles from '../styles/DeckCard.module.css';

interface DeckCardProps {
  deck: {
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
  };
}

function DeckCard({ deck }: DeckCardProps) {
  const [likes, setLikes] = useState(deck.likes);
  const [hasLiked, setHasLiked] = useState(false);

  function getCardImageUrl(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, '-')
      .replace(/'/g, '');
    return `https://cdn.royaleapi.com/static/img/cards-150/${slug}.png`;
  }

  async function handleLike() {
    if (hasLiked) return;
    
    try {
      const newLikes = await likeDeck(deck.id);
      setLikes(newLikes);
      setHasLiked(true);
    } catch (error: any) {
      console.error('Error liking deck:', error);
      
      if (error.response?.data?.message?.includes('already liked')) {
        setHasLiked(true);
      }
    }
  }

  function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      'LEGENDARY': '#FFD700',
      'EPIC': '#A855F7',
      'RARE': '#FF6B35',
      'COMMON': '#94A3B8'
    };
    return colors[rarity] || '#94A3B8';
  }

  return (
    <div className={styles.deckCard}>
      {/* Header */}
      <div className={styles.deckHeader}>
        <div className={styles.deckInfo}>
          <h3 className={styles.deckName}>{deck.name}</h3>
          <p className={styles.deckOwner}>by {deck.owner.name}</p>
        </div>
        <div className={styles.avgElixir}>
          <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirIcon} />
          <span>{deck.avgElixir}</span>
        </div>
      </div>

      {/* Description */}
      <p className={styles.deckDescription}>{deck.description}</p>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {deck.cards
          .sort((a, b) => a.position - b.position)
          .map((deckCard) => (
            <div
              key={deckCard.position}
              className={styles.cardWrapper}
              style={{ '--rarity-color': getRarityColor(deckCard.card.rarity) } as React.CSSProperties}
            >
              <img
                src={getCardImageUrl(deckCard.card.name)}
                alt={deckCard.card.name}
                className={styles.cardImage}
              />
              <div className={styles.cardElixir}>
                <img src="/src/assets/elixir.png" alt="Elixir" className={styles.cardElixirIcon} />
                <span>{deckCard.card.elixir}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className={styles.deckFooter}>
        <button
          className={`${styles.likeButton} ${hasLiked ? styles.liked : ''}`}
          onClick={handleLike}
          disabled={hasLiked}
        >
          <span className={styles.likeIcon}>{hasLiked ? '❤️' : '🤍'}</span>
          <span className={styles.likeCount}>{likes}</span>
        </button>
      </div>
    </div>
  );
}

export default DeckCard;