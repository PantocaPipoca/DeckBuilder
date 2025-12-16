// client/src/types/index.ts

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type CardType = 'TROOP' | 'SPELL' | 'BUILDING';
export type SortBy = 'rarity' | 'name' | 'elixir';
export type SortOrder = 'asc' | 'desc';

// Represents a Clash Royale card
export interface Card {
  id: number;
  name: string;
  elixir: number;
  rarity: Rarity;
  type: CardType;
  description: string;
  iconUrl: string;
}

// A deck of 8 cards
// Represents a card in a deck (with position)
export interface DeckCard {
  position: number;
  card: Card;
}

export interface Deck {
  id: number;
  name: string;
  description: string;
  cards: DeckCard[];
  avgElixir: number;
  isPublic: boolean;
  likes: number;
  ownerId: number;
  slot: number;
  createdAt: string;
  updatedAt: string;
}

// User of the app
export interface User {
  id: number;
  name: string;
  email: string;
}

// Deck slot (0-4)
export interface DeckSlot {
  index: number;
  deck: Deck | null;
}

// Filter state
export interface FilterState {
  sortBy: SortBy;
  order: SortOrder;
  onSortChange: (sortBy: SortBy) => void;
  onOrderChange: (order: SortOrder) => void;
}

// Card selection state
export interface CardSelection {
  card: Card | null;
  isReplaceMode: boolean;
}

// Card component props
export interface CardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  showButtons?: boolean;
  onInfo?: () => void;
  onUse?: () => void;
  onRemove?: () => void;
}

// Deck builder props
export interface DeckBuilderProps {
  deck: Card[];
  onCardClick: (card: Card) => void;
}

// Card collection props
export interface CardCollectionProps {
  cards: Card[];
  cardsInDeck: Card[];
  selectedCard: Card | null;
  onCardClick: (card: Card) => void;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
}

// Card popup props
export interface CardPopupProps {
  card: Card | null;
  onClose: () => void;
}
