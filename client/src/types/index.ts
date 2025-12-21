// src/types/index.ts

/**
 * Here I define all types and interfaces I am gonna use
 */
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type CardType = 'TROOP' | 'SPELL' | 'BUILDING';
export type SortBy = 'rarity' | 'name' | 'elixir';
export type SortOrder = 'asc' | 'desc';

/**
 * Represents a card in the game
 */
export interface Card {
  id: number;
  name: string;
  elixir: number;
  rarity: Rarity;
  type: CardType;
  description: string;
  iconUrl: string;
}

/**
 * Represents a deck of cards
 */
export interface Deck {
  id: number;
  name: string;
  description: string;
  cards: Card[];
  avgElixir: number;
  isPublic: boolean;
  likes: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a user of the application
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Represents a slot for a deck 0-4
 */
export interface DeckSlot {
  index: number;
  deck: Deck | null;
}

/**
 * Represents the current state of filters applied to card collection
 */
export interface FilterState {
  sortBy: SortBy;
  order: SortOrder;
  onSortChange: (sortBy: SortBy) => void;
  onOrderChange: (order: SortOrder) => void;
}

/**
 * Represents if card is selected and if in replace mode
 */
export interface CardSelection {
  card: Card | null;
  isReplaceMode: boolean;
}

/**
 * Represents a card in the UI
 */
export interface CardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  showButtons?: boolean;
  onInfo?: () => void;
  onUse?: () => void;
  onRemove?: () => void;
}

/**
 * Props for DeckBuilder component
 * @property deck: array of cards in the deck
 * @property onCardClick: function to call when a card is clicked
 */
export interface DeckBuilderProps {
  deck: Card[];
  onCardClick: (card: Card) => void;
}

/**
 * Props for CardCollection component
 */
export interface CardCollectionProps {
  cards: Card[];
  cardsInDeck: Card[];
  selectedCard: Card | null;
  onCardClick: (card: Card) => void;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
}

/**
 * Props for CardPopup component
 * @property card: the card to display info for
 * @property onClose: function to call when closing the popup
 */
export interface CardPopupProps {
  card: Card | null;
  onClose: () => void;
}

/**
 * Data provided by AuthContext
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Props for DeckCard
 */
export interface DeckCardProps {
  deck: {
    id: number;
    name: string;
    description: string;
    avgElixir: number;
    likes: number;
    owner: {
      id: number;
      name: string;
    };
    cards: Array<{
      position: number;
      card: {
        name: string;
        elixir: number;
        rarity: string;
      };
    }>;
    createdAt: string;
  };
}
/**
 * Public deck structure
 */
export interface PublicDeck {
  id: number;
  name: string;
  description: string;
  avgElixir: number;
  likes: number;
  owner: {
    id: number;
    name: string;
  };
  cards: Array<{
    position: number;
    card: {
      name: string;
      elixir: number;
      rarity: string;
    };
  }>;
  createdAt: string;
}
/**
 * Props for ShareDeckPopup
 */
export interface ShareDeckPopupProps {
  deck: Card[];
  deckId: number | null;
  deckSlot: number;
  onClose: () => void;
  onUpdate: (deck: any) => void;
}