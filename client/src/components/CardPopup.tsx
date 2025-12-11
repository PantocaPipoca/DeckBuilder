// src/components/CardPopup.tsx

import styles from '../styles/CardPopup.module.css';
import type { CardPopupProps } from '../types';

function CardPopup({ card, onClose }: CardPopupProps) {
  if (!card) return null;
  
  return (
    <>
      {/* Dark backdrop (click to close) */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Popup */}
      <div className={styles.popup}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        {/* Large card image */}
        <img src={card.iconUrl} alt={card.name} className={styles.image} />
        
        {/* Info */}
        <div className={styles.info}>
          <h2 className={styles.name}>{card.name}</h2>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.label}>Elixir</span>
              <span className={styles.value}>{card.elixir}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>Rarity</span>
              <span className={`${styles.value} ${styles[card.rarity.toLowerCase()]}`}>
                {card.rarity}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.label}>Type</span>
              <span className={styles.value}>{card.type}</span>
            </div>
          </div>
          
          <p className={styles.description}>{card.description}</p>
        </div>
      </div>
    </>
  );
}

export default CardPopup;