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
 * @property card: the card data
 * @property isSelected: if the card is currently selected or no
 * @property onClick: function to call when the card is clicked
 * @property showButtons: whether to show action buttons
 * @property onInfo: function to call when info button is clicked
 * @property onUse: function to call when use button is clicked
 * @property onRemove: function to call when remove button is clicked
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
 * @property cards: array of all available cards
 * @property cardsInDeck: array of cards currently in the deck
 * @property selectedCard: currently selected card or null
 * @property onCardClick: function to call when a card is clicked
 * @property filterState: current state of filters
 * @property onFilterChange: function to call when filters change
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