// src/types/deck.types.ts


/**
 * Data required to create a new deck
 * 
 * @property name: deck name
 * @property description: deck description (Optional)
 * @property cards: array of 8 card identifiers
 * @property isPublic: is the deck publicly visible (Optional) (default: false)
 * @property ownerId: deck owner`s id (Optional)
 */
export interface CreateDeckDTO {
  name: string;
  description?: string;
  cards: string[];
  isPublic?: boolean;
  ownerId?: number;
}

/**
 * Data you can update in an existing deck
 * All fields are optional: only provided fields will be updated
 * 
 * @property name: new deck name
 * @property description: new deck description
 * @property cards: new array of 8 card identifiers
 * @property isPublic: new visibility setting
 */
export interface UpdateDeckDTO {
  name?: string;
  description?: string;
  cards?: string[];
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