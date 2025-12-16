// src/types/deck.types.ts

// Data needed to create a deck
export interface CreateDeckDTO {
  name: string;
  description: string;
  cardNames: string[]; // 8 card names
  slot: number; // 0-4
  isPublic: boolean;
  ownerId: number;
}

// Data you can update
export interface UpdateDeckDTO {
  name?: string;
  description?: string;
  cardNames?: string[];
  slot?: number;
  isPublic?: boolean;
}

// Filters for getting decks
export interface DeckQueryParams {
  onlyPublic?: boolean;
  ownerId?: number;
  limit?: number;
  offset?: number;
}
