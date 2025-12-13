// src/pages/DecksPage.tsx
import { useState, useEffect, useRef } from 'react';
import { getAllCards, getUserDecks, createDeck, updateDeck, deleteDeck } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder, Rarity } from '../types';

function DecksPage() {
  const { user } = useAuth();
  
  // Estados
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<CardType[][]>([[], [], [], [], []]);
  const [deckIds, setDeckIds] = useState<(number | null)[]>([null, null, null, null, null]);
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [selectedCard, setCardAsSelected] = useState<CardType | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [popupCard, setPopupCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const deckBuilderRef = useRef<HTMLDivElement>(null);

  // Load cards and user's saved decks on mount
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const cards = await getAllCards();
      setAllCards(cards || []);

      // Load user's existing decks
      const userDecks = await getUserDecks();
      
      const newDecks: CardType[][] = [[], [], [], [], []];
      const newDeckIds: (number | null)[] = [null, null, null, null, null];

      // Map backend decks to slots using their slot field
      userDecks.forEach((deck: any) => {
        if (deck.slot >= 0 && deck.slot < 5) {
          // Extract cards from deck.cards array and find full card data
          const deckCards = deck.cards
            .sort((a: any, b: any) => a.position - b.position)
            .map((dc: any) => {
              const fullCard = cards.find((c: CardType) => c.name === dc.card.name);
              return fullCard;
            })
            .filter(Boolean) as CardType[];
          
          newDecks[deck.slot] = deckCards;
          newDeckIds[deck.slot] = deck.id;
        }
      });

      setDecks(newDecks);
      setDeckIds(newDeckIds);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Save or update deck when it has exactly 8 cards
  async function saveDeckIfComplete(deckIndex: number, cards: CardType[]) {
    if (cards.length !== 8) return;

    try {
      const cardNames = cards.map(c => c.name);
      const deckData = {
        name: `Deck ${deckIndex + 1}`,
        description: `Auto-saved deck slot ${deckIndex + 1}`,
        cardNames,
        slot: deckIndex,
        isPublic: false,
      };

      if (deckIds[deckIndex]) {
        // Update existing deck
        await updateDeck(deckIds[deckIndex]!, deckData);
      } else {
        // Create new deck
        const newDeck = await createDeck(deckData);
        const newDeckIds = [...deckIds];
        newDeckIds[deckIndex] = newDeck.id;
        setDeckIds(newDeckIds);
      }
    } catch (error) {
      console.error('Error saving deck:', error);
      alert('Failed to save deck. Please try again.');
    }
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

  async function handleUseCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    if (currentDeck.length >= 8) {
      setIsReplaceMode(true);
      deckBuilderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const newDecks = [...decks];
    const updatedDeck = [...currentDeck, card];
    newDecks[activeDeckIndex] = updatedDeck;
    setDecks(newDecks);
    setCardAsSelected(null);

    // Auto-save when deck reaches 8 cards
    if (updatedDeck.length === 8) {
      await saveDeckIfComplete(activeDeckIndex, updatedDeck);
    }
  }

  async function handleDeckCardClick(cardToReplace: CardType) {
    if (!isReplaceMode || !selectedCard) return;
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.map(c => (c.id === cardToReplace.id ? selectedCard : c));
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
    setIsReplaceMode(false);

    // Auto-save after replacement (deck is still 8 cards)
    await saveDeckIfComplete(activeDeckIndex, newDeck);
  }

  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.filter(c => c.id !== card.id);
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
    // Don't save incomplete decks
  }

  async function handleClearDeck() {
    if (!window.confirm('Clear this deck? This will delete it from the server.')) return;

    const newDecks = [...decks];
    newDecks[activeDeckIndex] = [];
    setDecks(newDecks);

    // Delete from backend if it exists
    if (deckIds[activeDeckIndex]) {
      try {
        await deleteDeck(deckIds[activeDeckIndex]!);
        const newDeckIds = [...deckIds];
        newDeckIds[activeDeckIndex] = null;
        setDeckIds(newDeckIds);
      } catch (error) {
        console.error('Error deleting deck:', error);
      }
    }
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

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            Loading decks...
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Header />
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

          {/* Deck Builder */}
          <div ref={deckBuilderRef} className={styles.deckSection}>
            <div className={styles.deckHeader}>
              <h2>
                Your Deck ({currentDeck.length}/8)
              </h2>
              {currentDeck.length > 0 && (
                <button
                  onClick={handleClearDeck}
                  className={styles.clearButton}
                >
                  CLEAR DECK
                </button>
              )}
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
    </>
  );
}

export default DecksPage;