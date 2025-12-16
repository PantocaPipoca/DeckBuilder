// src/components/CardPopup.tsx
import styles from '../styles/CardPopup.module.css';
import type { CardPopupProps } from '../types';

function CardPopup({ card, onClose }: CardPopupProps) {
  if (!card) return null;
  
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        <div className={styles.topSection}>
          <div className={styles.cardContainer}>
            <img src={card.iconUrl} alt={card.name} className={styles.image} />
            <div className={styles.elixirBadge}>
              <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirImg} />
              <span>{card.elixir}</span>
            </div>
          </div>
          
          <div className={styles.statsBox}>
            <h2 className={styles.name}>{card.name}</h2>
            <div style={{ flex: 1 }} />
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.label}>Rarity</span>
                <span className={`${styles.value} ${styles[card.rarity.toLowerCase()]}`}>{card.rarity}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.label}>Type</span>
                <span className={styles.value}>{card.type}</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className={styles.description}>{card.description}</p>
      </div>
    </>
  );
}

export default CardPopup;
