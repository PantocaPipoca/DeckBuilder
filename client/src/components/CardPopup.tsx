// src/components/CardPopup.tsx

import styles from '../styles/CardPopup.module.css';
import type { Card } from '../types';

interface CardPopupProps {
  card: Card | null;
  onClose: () => void;
}

function CardPopup({ card, onClose }: CardPopupProps) {
  if (!card) return null;
  
  return (
    <>
      {/* Backdrop escuro (clica para fechar) */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Popup */}
      <div className={styles.popup}>
        {/* Botão X para fechar */}
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        
        {/* Imagem grande da carta */}
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