// src/pages/DecksPage.tsx

import { useState, useEffect, useRef } from 'react';
import { getAllCards } from '../services/api';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder, Rarity } from '../types';

function DecksPage() {
  
  // ========== ESTADO ==========
  
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<CardType[][]>([[], [], [], [], []]);
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [popupCard, setPopupCard] = useState<CardType | null>(null);
  
  // Ref para scroll
  const deckBuilderRef = useRef<HTMLDivElement>(null);
  
  // ========== CARREGAR CARTAS ==========
  
  useEffect(() => {
    loadCards();
  }, []);
  
  async function loadCards() {
    const cards = await getAllCards();
    setAllCards(cards);
  }
  
  // ========== ORDENAR CARTAS ==========
  
  const sortedCards = [...allCards].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'elixir') {
      comparison = a.elixir - b.elixir;
    } else if (sortBy === 'rarity') {
      const rarityOrder: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
      comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  // ========== AÇÕES ==========
  
  function handleCollectionCardClick(card: CardType) {
    setSelectedCard(card);
    setIsReplaceMode(false);
  }
  
  function handleUseCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    
    if (currentDeck.length >= 8) {
      // Deck cheio - entra em replace mode
      setIsReplaceMode(true);
      // Scroll para o deck
      deckBuilderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Adiciona carta
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = [...currentDeck, card];
    setDecks(newDecks);
    setSelectedCard(null);
  }
  
  function handleDeckCardClick(cardToReplace: CardType) {
    if (!isReplaceMode || !selectedCard) return;
    
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.map(c => 
      c.id === cardToReplace.id ? selectedCard : c
    );
    
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    
    // Reset
    setSelectedCard(null);
    setIsReplaceMode(false);
  }
  
  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.filter(c => c.id !== card.id);
    
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setSelectedCard(null);
  }
  
  function switchDeck(index: number) {
    setActiveDeckIndex(index);
    setSelectedCard(null);
    setIsReplaceMode(false);
  }
  
  // ========== HELPERS ==========
  
  const currentDeck = decks[activeDeckIndex];
  const cardIdsInDeck = currentDeck.map(c => c.id);
  
  // ========== RENDER ==========
  
  return (
    <div className={styles.page}>
      
      {/* Deck Slots */}
      <div className={styles.deckSlots}>
        {[0, 1, 2, 3, 4].map(index => (
          <button
            key={index}
            className={`${styles.deckSlot} ${index === activeDeckIndex ? styles.active : ''}`}
            onClick={() => switchDeck(index)}
          >
            Deck {index + 1}
          </button>
        ))}
      </div>
      
      {/* Deck Builder */}
      <div className={styles.deckBuilder} ref={deckBuilderRef}>
        <h2>Your Deck ({currentDeck.length}/8)</h2>
        <div className={styles.deckGrid}>
          {currentDeck.map(card => (
            <Card
              key={card.id}
              card={card}
              isSelected={false}
              showButtons={selectedCard?.id === card.id && !isReplaceMode}
              onClick={() => {
                if (isReplaceMode) {
                  handleDeckCardClick(card);
                } else {
                  setSelectedCard(card);
                }
              }}
              onInfo={() => setPopupCard(card)}
              onRemove={() => handleRemoveCard(card)}
            />
          ))}
          
          {/* Slots vazios */}
          {Array(8 - currentDeck.length).fill(0).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptySlot}>+</div>
          ))}
        </div>
      </div>
      
      {/* Replace Mode - Mostra carta selecionada */}
      {isReplaceMode && selectedCard && (
        <div className={styles.replacePrompt}>
          <p>Click on a card in your deck to replace it</p>
          <Card
            card={selectedCard}
            isSelected={true}
            showButtons={false}
            onClick={() => {}}
          />
          <button 
            className={styles.cancelButton}
            onClick={() => {
              setIsReplaceMode(false);
              setSelectedCard(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Card Collection */}
      {!isReplaceMode && (
        <div className={styles.collection}>
          <h2>Card Collection</h2>
          
          {/* Filtros */}
          <FilterBar
            sortBy={sortBy}
            order={order}
            onSortChange={setSortBy}
            onOrderChange={setOrder}
          />
          
          <div className={styles.cardGrid}>
            {sortedCards.map(card => {
              const inDeck = cardIdsInDeck.includes(card.id);
              const isSelected = selectedCard?.id === card.id;
              
              return (
                <div key={card.id} style={{ opacity: inDeck ? 0.3 : 1 }}>
                  <Card
                    card={card}
                    isSelected={isSelected}
                    showButtons={isSelected && !inDeck}
                    onClick={() => !inDeck && handleCollectionCardClick(card)}
                    onInfo={() => setPopupCard(card)}
                    onUse={() => handleUseCard(card)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Popup de Info */}
      {popupCard && (
        <CardPopup 
          card={popupCard} 
          onClose={() => setPopupCard(null)} 
        />
      )}
      
    </div>
  );
}

export default DecksPage;