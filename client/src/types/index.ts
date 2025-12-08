export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type CardType = 'TROOP' | 'SPELL' | 'BUILDING';
export type SortBy = 'rarity' | 'name' | 'elixir';
export type SortOrder = 'asc' | 'desc';


export interface Card {
  id: number;
  name: string;
  elixir: number;
  rarity: Rarity;
  type: CardType;
  description: string;
  iconUrl: string;
}

export interface Deck {
  id: number;
  name: string;
  description: string;
  cards: Card[];  // Array (como List em Java)
  avgElixir: number;
  isPublic: boolean;
  likes: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface DeckSlot {
  index: number;      // 0-4 (qual dos 5 slots)
  deck: Deck | null;  // null = slot vazio
}

export interface FilterState {
  sortBy: SortBy;
  order: SortOrder;
  onSortChange: (sortBy: SortBy) => void;
  onOrderChange: (order: SortOrder) => void;
}

export interface CardSelection {
  card: Card | null;
  isReplaceMode: boolean;
}

export interface CardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  showButtons?: boolean;
  onInfo?: () => void;
  onUse?: () => void;
  onRemove?: () => void;
}

export interface DeckBuilderProps {
  deck: Card[];
  onCardClick: (card: Card) => void;
}

export interface CardCollectionProps {
  cards: Card[];
  cardsInDeck: Card[];
  selectedCard: Card | null;
  onCardClick: (card: Card) => void;
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
}