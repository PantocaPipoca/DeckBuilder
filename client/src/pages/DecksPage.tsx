// src/pages/DecksPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCards, getUserDecks, createDeck, updateDeck, deleteDeck } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder, Rarity } from '../types';
import ShareDeckPopup from '../components/ShareDeckPopup';

function DecksPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
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
  const [showSharePopup, setShowSharePopup] = useState(false);

  const deckBuilderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const cards = await getAllCards();
      setAllCards(cards || []);

      const userDecks = await getUserDecks();
      
      const newDecks: CardType[][] = [[], [], [], [], []];
      const newDeckIds: (number | null)[] = [null, null, null, null, null];

      userDecks.forEach((deck: any) => {
        if (deck.slot >= 0 && deck.slot < 5) {
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
        await updateDeck(deckIds[deckIndex]!, deckData);
      } else {
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

    await saveDeckIfComplete(activeDeckIndex, newDeck);
  }

  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    const newDeck = currentDeck.filter(c => c.id !== card.id);
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setCardAsSelected(null);
  }

  async function handleClearDeck() {
    if (!window.confirm('Clear this deck? This will delete it from the server.')) return;

    const newDecks = [...decks];
    newDecks[activeDeckIndex] = [];
    setDecks(newDecks);

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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const currentDeck = decks[activeDeckIndex];
  const cardIdsInDeck = currentDeck.map(c => c.id);

  const avgElixir = currentDeck.length > 0
    ? (currentDeck.reduce((s, c) => s + c.elixir, 0) / currentDeck.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          Loading decks...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.deckBuilder}>
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
          
          <div className={styles.statsBar}>
            <div className={styles.avgElixir}>
              <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirIcon} />
              <span>{avgElixir}</span>
            </div>
            
            <button 
              onClick={() => setShowSharePopup(true)} 
              className={styles.shareButton}
              title="Share Deck"
              disabled={currentDeck.length !== 8}
            >
              🔗
            </button>
            
            <button onClick={handleLogout} className={styles.logoutButton} title="Logout">
              🚪
            </button>
          </div>
        </div>

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

        {popupCard && (
          <CardPopup
            card={popupCard}
            onClose={() => setPopupCard(null)}
          />
        )}
        {showSharePopup && currentDeck.length === 8 && (
          <ShareDeckPopup
            deck={currentDeck}
            deckId={deckIds[activeDeckIndex]}
            deckSlot={activeDeckIndex}
            onClose={() => setShowSharePopup(false)}
            onUpdate={(updatedDeck) => {
              const newDeckIds = [...deckIds];
              if (updatedDeck.id) {
                newDeckIds[activeDeckIndex] = updatedDeck.id;
                setDeckIds(newDeckIds);
              }
            }}
          />
        )}
        
        <NavBar />
      </div>
    </div>
  );
}

export default DecksPage;