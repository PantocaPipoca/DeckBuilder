// src/types/deck.types.ts

/**
 * Data needed to create a deck
 * @property name: name
 * @property description: description
 * @property cardNames: 8 card names
 * @property slot: deck slot (0-4)
 * @property isPublic: is public
 * @property ownerId: owner id
 * 
 */
export interface CreateDeckDTO {
  name: string;
  description: string;
  cardNames: string[]; //8 card names
  slot: number; // 0-4
  isPublic: boolean;
  ownerId: number;
}

/**
 * Data I can update
 * @property name: name of deck
 * @property description: description
 * @property cardNames: 8 card names
 * @property slot: deck slot (0-4)
 * @property isPublic: is public
 */
export interface UpdateDeckDTO {
  name?: string;
  description?: string;
  cardNames?: string[];
  slot?: number;
  isPublic?: boolean;
}

/**
 * Filters for getting decks
 * @property onlyPublic: only public decks
 * @property ownerId: owner id
 * @property limit: limit decks
 * @property offset: offset for pagination
 */
export interface DeckQueryParams {
  onlyPublic?: boolean;
  ownerId?: number;
  limit?: number;
  offset?: number;
}
