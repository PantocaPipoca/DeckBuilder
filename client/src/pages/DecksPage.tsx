// src/pages/DecksPage.tsx

import { useState, useEffect, useRef } from 'react';
import { getAllCards } from '../services/api';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder, Rarity } from '../types';

function DecksPage() {
  
  // Use State creates something like a variable in the first parameter and the setter function
  // in the second parameter that updates the UI whenever it runs

  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<CardType[][]>([[], [], [], [], []]);
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [selectedCard, setCardAsSelected] = useState<CardType | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [popupCard, setPopupCard] = useState<CardType | null>(null);
  
  // Reference for the deck to later have automatic scroll to the full deck
  // Basically saves a reference to the html of the spot where we will scroll to
  const deckBuilderRef = useRef<HTMLDivElement>(null);
  
  // Load Cards
  
  useEffect(() => {
    loadCards();
  }, []);
  
  async function loadCards() {
    const cards = await getAllCards();
    setAllCards(cards); // Saves the data of cards in the state variable
  }
  
  // Sort Cards
  
  const sortedCards = [...allCards].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      // localeCompare used in case I decide to add different languages with accents
      comparison = a.name.localeCompare(b.name);
    }
    else if (sortBy === 'elixir') {
      comparison = a.elixir - b.elixir;
    }
    else if (sortBy === 'rarity') {
      const rarityOrder: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
      comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  // Functions
  
  /**
   * Handles click on a card when in the collection
   * @param card Card clicked
   */
  function handleCollectionCardClick(card: CardType) {
    setCardAsSelected(card);
    setIsReplaceMode(false);
  }
  
  /**
   * Handles click of use button on a card thtats in the collection
   * @param card Card to use
   * @returns void
   */
  function handleUseCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    
    if (currentDeck.length >= 8) {
      // Deck full enter replace mode
      setIsReplaceMode(true);
      // Scroll to the deck
      deckBuilderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Add card normally
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = [...currentDeck, card];
    setDecks(newDecks);
    setCardAsSelected(null);
  }
  
  /**
   * Handles click on a card when its in replace mode
   * @param cardToReplace Card to replace in the deck
   * @returns void
   */
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
    setCardAsSelected(null);
    setIsReplaceMode(false);
  }
  
  /**
   * Removes a card from the current deck
   * @param card Card to remove
   */
  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.filter(c => c.id !== card.id);
    
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
  }
  
  /**
   * Switches active deck
   * @param index Index of the deck to switch to
   */
  function switchDeck(index: number) {
    setActiveDeckIndex(index);
    setCardAsSelected(null);
    setIsReplaceMode(false);
  }
  
  const currentDeck = decks[activeDeckIndex];
  const cardIdsInDeck = currentDeck.map(c => c.id);
  
  // Render
  
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
                  setCardAsSelected(card);
                }
              }}
              onInfo={() => setPopupCard(card)}
              onRemove={() => handleRemoveCard(card)}
            />
          ))}
          
          {/* Empty Slots */}
          {Array(8 - currentDeck.length).fill(0).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptySlot}>+</div>
          ))}
        </div>
      </div>
      
      {/* Replace Mode - Shows selected card */}
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
              setCardAsSelected(null);
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
          
          {/* Filters */}
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