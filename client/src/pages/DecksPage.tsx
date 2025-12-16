// client/src/pages/DecksPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCards, getUserDecks, createDeck, updateDeck, deleteDeck } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Card from '../components/Card';
import FilterBar from '../components/FilterBar';
import CardPopup from '../components/CardPopup';
import ShareDeckPopup from '../components/ShareDeckPopup';
import styles from '../styles/DecksPage.module.css';
import type { Card as CardType, SortBy, SortOrder } from '../types';

function DecksPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<CardType[][]>([[], [], [], [], []]);
  const [deckIds, setDeckIds] = useState<(number | null)[]>([null, null, null, null, null]);
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [popupCard, setPopupCard] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSharePopup, setShowSharePopup] = useState(false);

  const deckBuilderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      const cards = await getAllCards();
      setAllCards(cards || []);

      const userDecks = await getUserDecks();
      
      const newDecks: CardType[][] = [[], [], [], [], []];
      const newDeckIds: (number | null)[] = [null, null, null, null, null];

      // Fill in saved decks
      for (let i = 0; i < userDecks.length; i++) {
        const deck = userDecks[i];
        
        if (deck.slot >= 0 && deck.slot < 5) {
          const sortedCards = [...deck.cards];
          sortedCards.sort((a: any, b: any) => a.position - b.position);
          
          const deckCards: CardType[] = [];
          for (const dc of sortedCards) {
            const card = cards.find((c: CardType) => c.name === dc.card.name);
            if (card) {
              deckCards.push(card);
            }
          }
          
          newDecks[deck.slot] = deckCards;
          newDeckIds[deck.slot] = deck.id;
        }
      }

      setDecks(newDecks);
      setDeckIds(newDeckIds);
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  }

  // Auto-save when deck is complete
  async function saveDeck(deckIndex: number, cards: CardType[]) {
    if (cards.length !== 8) return;

    try {
      const cardNames: string[] = [];
      for (const card of cards) {
        cardNames.push(card.name);
      }

      const deckData = {
        name: `Deck ${deckIndex + 1}`,
        description: `Deck slot ${deckIndex + 1}`,
        cardNames: cardNames,
        slot: deckIndex,
        isPublic: false,
      };

      if (deckIds[deckIndex]) {
        await updateDeck(deckIds[deckIndex]!, deckData);
      } else {
        const newDeck = await createDeck(deckData);
        const ids = [...deckIds];
        ids[deckIndex] = newDeck.id;
        setDeckIds(ids);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Failed to save deck');
    }
  }

  function getSortedCards() {
    const sorted = [...allCards];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'elixir') {
        comparison = a.elixir - b.elixir;
      } else if (sortBy === 'rarity') {
        const rarityValues: any = { 
          COMMON: 0, 
          RARE: 1, 
          EPIC: 2, 
          LEGENDARY: 3 
        };
        comparison = rarityValues[a.rarity] - rarityValues[b.rarity];
      }
      
      if (order === 'desc') {
        comparison = -comparison;
      }
      
      return comparison;
    });
    
    return sorted;
  }

  function handleCollectionCardClick(card: CardType) {
    setSelectedCard(card);
    setIsReplaceMode(false);
  }

  async function handleUseCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    
    if (currentDeck.length >= 8) {
      // Deck is full - enter replace mode
      setIsReplaceMode(true);
      if (deckBuilderRef.current) {
        deckBuilderRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }
    
    // Add card to deck
    const newDecks = [...decks];
    const updatedDeck = [...currentDeck, card];
    newDecks[activeDeckIndex] = updatedDeck;
    setDecks(newDecks);
    setSelectedCard(null);

    if (updatedDeck.length === 8) {
      await saveDeck(activeDeckIndex, updatedDeck);
    }
  }

  // Replace card when in replace mode
  async function handleDeckCardClick(cardToReplace: CardType) {
    if (!isReplaceMode || !selectedCard) return;
    
    const currentDeck = decks[activeDeckIndex];
    
    const newDeck: CardType[] = [];
    for (const card of currentDeck) {
      if (card.id === cardToReplace.id) {
        newDeck.push(selectedCard);
      } else {
        newDeck.push(card);
      }
    }
    
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setSelectedCard(null);
    setIsReplaceMode(false);

    await saveDeck(activeDeckIndex, newDeck);
  }

  function handleRemoveCard(card: CardType) {
    const currentDeck = decks[activeDeckIndex];
    
    const newDeck: CardType[] = [];
    for (const c of currentDeck) {
      if (c.id !== card.id) {
        newDeck.push(c);
      }
    }
    
    const newDecks = [...decks];
    newDecks[activeDeckIndex] = newDeck;
    setDecks(newDecks);
    setSelectedCard(null);
  }

  async function handleClearDeck() {
    if (!window.confirm('Clear this deck?')) return;

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
        console.error('Delete error:', error);
      }
    }
  }

  function switchDeck(index: number) {
    setActiveDeckIndex(index);
    setSelectedCard(null);
    setIsReplaceMode(false);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const currentDeck = decks[activeDeckIndex];
  
  // Get card IDs in current deck
  const cardIdsInDeck: number[] = [];
  for (const card of currentDeck) {
    cardIdsInDeck.push(card.id);
  }

  // Calculate average elixir
  let avgElixir = '0.0';
  if (currentDeck.length > 0) {
    let total = 0;
    for (const card of currentDeck) {
      total += card.elixir;
    }
    const avg = total / currentDeck.length;
    avgElixir = avg.toFixed(1);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>Loading decks...</div>
      </div>
    );
  }

  const sortedCards = getSortedCards();

  return (
    <div className={styles.page}>
      <div className={styles.deckBuilder}>
        
        {/* Deck slots 1-5 */}
        <div className={styles.deckSlots}>
          {[0, 1, 2, 3, 4].map(i => (
            <button
              key={i}
              className={`${styles.deckSlot} ${i === activeDeckIndex ? styles.active : ''}`}
              onClick={() => switchDeck(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Current deck display */}
        <div ref={deckBuilderRef} className={styles.deckSection}>
          <div className={styles.deckHeader}>
            <h2>Your Deck ({currentDeck.length}/8)</h2>
            {currentDeck.length > 0 && (
              <button onClick={handleClearDeck} className={styles.clearButton}>
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
                    if (isReplaceMode) {
                      handleDeckCardClick(card);
                    } else {
                      setSelectedCard(card);
                    }
                  }}
                  onInfo={() => setPopupCard(card)}
                  onRemove={() => handleRemoveCard(card)}
                />
              </div>
            ))}

            {/* Empty slots */}
            {Array(8 - currentDeck.length).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>+</div>
            ))}
          </div>
          
          {/* Stats bar */}
          <div className={styles.statsBar}>
            <div className={styles.avgElixir}>
              <img src="/src/assets/elixir.png" alt="Elixir" className={styles.elixirIcon} />
              <span>{avgElixir}</span>
            </div>
            
            <button 
              onClick={() => setShowSharePopup(true)} 
              className={styles.shareButton}
              disabled={currentDeck.length !== 8}
            >
              🔗
            </button>
            
            <button onClick={handleLogout} className={styles.logoutButton}>
              🚪
            </button>
          </div>
        </div>

        {/* Replace mode UI */}
        {isReplaceMode && selectedCard && (
          <div className={styles.replacePrompt}>
            <p>Click a card in your deck to replace it</p>
            <Card card={selectedCard} isSelected={true} showButtons={false} onClick={() => {}} />
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

        {/* Card collection */}
        <div className={`${styles.collection} ${isReplaceMode ? styles.hidden : ''}`}>
          <div className={styles.separator}></div>

          <div className={styles.filterWrapper}>
            <h2 className={styles.collectionTitle}>Card Collection</h2>
            <FilterBar
              sortBy={sortBy}
              order={order}
              onSortChange={setSortBy}
              onOrderChange={setOrder}
            />
          </div>

          <div className={styles.cardGrid}>
            {sortedCards.length === 0 ? (
              <div className={styles.cardLoading}>Loading cards...</div>
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

        {popupCard && <CardPopup card={popupCard} onClose={() => setPopupCard(null)} />}
        
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
