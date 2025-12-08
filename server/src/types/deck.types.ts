// src/types/deck.types.ts


/**
 * Data required to create a new deck
 * 
 * @property name: deck name
 * @property description: deck description
 * @property cardNames: array of 8 card names
 * @property isPublic: is the deck publicly visible
 * @property ownerId: deck owner's id
 */
export interface CreateDeckDTO {
  name: string;
  description: string;
  cardNames: string[];
  isPublic: boolean;
  ownerId: number;
}

/**
 * Data you can update in an existing deck
 * All fields are optional: only provided fields will be updated
 * 
 * @property name: deck name
 * @property description: deck description
 * @property cardNames: array of 8 card names
 * @property isPublic: is the deck publicly visible
 */
export interface UpdateDeckDTO {
  name?: string;
  description?: string;
  cardNames?: string[];
  isPublic?: boolean;
}

/**
 * Query parameters for filtering decks
 * 
 * @property onlyPublic: if true, returns only public decks
 * @property ownerId: filter decks by owner ID
 * @property limit: maximum number of results to return
 * @property offset: number of results to skip (for possible future pagination)
 */
export interface DeckQueryParams {
  onlyPublic?: boolean;
  ownerId?: number;
  limit?: number;
  offset?: number;
}