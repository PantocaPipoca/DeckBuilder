export interface CreateDeckDTO {
  name: string;
  description?: string;
  cards: string[];
  isPublic?: boolean;
  ownerId?: number;
}

export interface UpdateDeckDTO {
  name?: string;
  description?: string;
  cards?: string[];
  isPublic?: boolean;
}

export interface DeckQueryParams {
  onlyPublic?: boolean;
  ownerId?: number;
  limit?: number;
  offset?: number;
}