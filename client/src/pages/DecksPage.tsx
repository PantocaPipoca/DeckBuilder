// src/pages/DecksPage.tsx
import { useState, useEffect, useRef } from 'react';
import { getAllCards } from '../services/api';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder, Rarity } from '../types';

function DecksPage() {
  // Estados
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<CardType[][]>([[], [], [], [], []]);
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [selectedCard, setCardAsSelected] = useState<CardType | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [popupCard, setPopupCard] = useState<CardType | null>(null);

  const deckBuilderRef = useRef<HTMLDivElement>(null);

  // Load cards
  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    const cards = await getAllCards();
    setAllCards(cards || []);
  }

  // Sorted cards
  const sortedCards = [...allCards].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'elixir') comparison = a.elixir - b.elixir;
    else if (sortBy === 'rarity') {
      const rarityOrder: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
      comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
    }
    return order === 'asc' ? comparison : -comparison;
  });

  // Handlers
  function handleCollectionCardClick(card: CardType) {
    setCardAsSelected(card);
    setIsReplaceMode(false);
  }

  function handleUseCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    if (currentDeck.length >= 8) {
      setIsReplaceMode(true);
      deckBuilderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = [...currentDeck, card];
    setDecks(newDecks);
    setCardAsSelected(null);
  }

  function handleDeckCardClick(cardToReplace: CardType) {
    if (!isReplaceMode || !selectedCard) return;
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.map(c => (c.id === cardToReplace.id ? selectedCard : c));
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
    setIsReplaceMode(false);
  }

  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.filter(c => c.id !== card.id);
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
  }

  function switchDeck(index: number) {
    setActiveDeckIndex(index);
    setCardAsSelected(null);
    setIsReplaceMode(false);
  }

  const currentDeck = decks[activeDeckIndex];
  const cardIdsInDeck = currentDeck.map(c => c.id);

  const avgElixir = currentDeck.length > 0
    ? (currentDeck.reduce((s, c) => s + c.elixir, 0) / currentDeck.length).toFixed(1)
    : '0.0';

  // Render
  return (
    <div className={styles.page}>
      <div className={styles.deckBuilder}>
        {/* Deck slots */}
        <div className={styles.deckSlots}>
          {[0, 1, 2, 3, 4].map(index => (
            <button
              key={index}
              className={`${styles.deckSlot} ${index === activeDeckIndex ? styles.active : ''}`}
              onClick={() => switchDeck(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Deck Builder I give the ref for autoscroll */}
        <div ref={deckBuilderRef} className={styles.deckSection}>
          <div className={styles.deckHeader}>
            <h2 style={{ visibility: 'hidden' }}>Your Deck ({currentDeck.length}/8)</h2>
          </div>
          <div className={styles.deckGrid}>
            {currentDeck.map(card => (
              <div key={card.id} className={isReplaceMode ? styles.shaking : ''}>
                <Card
                  card={card}
                  isSelected={false}
                  showButtons={selectedCard?.id === card.id && !isReplaceMode}
                  onClick={() => {
                    if (isReplaceMode) handleDeckCardClick(card);
                    else setCardAsSelected(card);
                  }}
                  onInfo={() => setPopupCard(card)}
                  onRemove={() => handleRemoveCard(card)}
                />
              </div>
            ))}

            {Array(8 - currentDeck.length).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>+</div>
            ))}
          </div>
          
          <div className={styles.avgElixir}>
            <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirIcon} />
            <span>{avgElixir}</span>
          </div>
        </div>

        {/* Replace Mode */}
        {isReplaceMode && selectedCard && (
          <div className={styles.replacePrompt} style={{ marginTop: 12 }}>
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
        <div className={`${styles.collection} ${isReplaceMode ? styles.hidden : ''}`}>
          <div className={styles.separator}></div>

          <div className={styles.filterWrapper}>
            <h2 className={styles.collectionTitle}>Card Collection</h2>
            <FilterBar
              sortBy={sortBy}
              order={order}
              onSortChange={(s) => setSortBy(s)}
              onOrderChange={(o) => setOrder(o)}
            />
          </div>

          {/* Cards grid */}
          <div className={styles.cardGrid}>
            {sortedCards.length === 0 ? (
              <div className={styles.cardLoading}>
                Loading cards...
              </div>
            ) : (
              sortedCards.map(card => {
                const inDeck = cardIdsInDeck.includes(card.id);
                const isSelected = selectedCard?.id === card.id;

                return (
                  <div key={card.id} className={inDeck ? styles.cardInDeck : ''}>
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
              })
            )}
          </div>
        </div>

        {/* Popup of Info */}
        {popupCard && (
          <CardPopup
            card={popupCard}
            onClose={() => setPopupCard(null)}
          />
        )}
      </div>
    </div>
  );
}

export default DecksPage;
