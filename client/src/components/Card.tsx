// src/components/Card.tsx

import styles from '../styles/Card.module.css';
import type { CardProps, Rarity } from '../types';

/**
 * Card component ez
 */
function Card({ card, isSelected, onClick, showButtons, onInfo, onUse, onRemove }: CardProps) {
  
  const rarityColors: Record<Rarity, string> = {
    'LEGENDARY': '#FFD700',
    'EPIC': '#A855F7',
    'RARE': '#FF6B35',
    'COMMON': '#94A3B8'
  };
  
  const glowColor = rarityColors[card.rarity];
  
  return (
    <div>
      {/* The card */}
      <div 
        className={`${styles.card} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
        style={{ '--glow-color': glowColor } as React.CSSProperties}
      >
        <img src={card.iconUrl} alt={card.name} className={styles.cardImage} />
        <div className={styles.elixirBadge}>
          <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirImg} />
          <span>{card.elixir}</span>
        </div>
        <div className={styles.cardName}>{card.name}</div>
      </div>
      
      {/* Buttons appear when showButtons = true */}
      {showButtons && (
        <div className={styles.buttonContainer}>
          <button className={styles.infoButton} onClick={onInfo}>
            INFO
          </button>
          <button 
            className={onRemove ? styles.removeButton : styles.useButton}
            onClick={onRemove || onUse}
          >
            {onRemove ? 'REMOVE' : 'USE'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Card;