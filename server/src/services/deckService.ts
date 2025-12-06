// src/services/deckService.ts
import prisma from '../configs/database';
import { CreateDeckDTO, UpdateDeckDTO, DeckQueryParams } from '../types/deck.types';
import { DECK_CONFIG } from '../configs/constants';
import { HTTP_STATUS } from '../configs/constants';


/**
 * Essencially this is a class that provides static methods to manage decks IN THE DATABASE.
 * Used by the DeckController.
 */

export class DeckService {

  /**
   * Lists decks with optional filtering
   * 
   * @param params: query parameters for filtering and pagination
   * @param params.onlyPublic: return only public decks
   * @param params.ownerId: filter by owner ID
   * @param params.limit: maximum results (default: 50)
   * @param params.offset: skip n results (default: 0)
   * @returns array of decks with owner information
   */
  static async listDecks(params: DeckQueryParams = {}) {
    const { onlyPublic, ownerId, limit = 50, offset = 0 } = params;

    const where: any = {};
    if (onlyPublic) where.isPublic = true;
    if (ownerId) where.ownerId = ownerId;

    return prisma.deck.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Gets a single deck by ID
   * 
   * @param id: deck ID
   * @returns deck with owner information
   * @throws error with statusCode 404 if deck not found
   */
  static async getDeckById(id: number) {
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!deck) {
      const error: any = new Error('Deck não encontrado');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return deck;
  }

  /**
   * Creates a new deck
   * 
   * @param data: deck creation data
   * @returns created deck with owner information
   * @throws error with statusCode 400 if validation fails
   */
  static async createDeck(data: CreateDeckDTO) {
    // Validation
    if (!data.cards || data.cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      const error: any = new Error(
        `Deck deve ter exatamente ${DECK_CONFIG.CARDS_PER_DECK} cartas`
      );
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    if (data.name.length > DECK_CONFIG.MAX_NAME_LENGTH) {
      const error: any = new Error('Nome do deck muito longo');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    return prisma.deck.create({
      data: {
        name: data.name,
        description: data.description || '',
        cards: data.cards as any,
        isPublic: data.isPublic ?? false,
        likes: 0,
        ownerId: data.ownerId ?? null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Updates an existing deck
   * Only provided fields will be updated.
   * 
   * @param id: deck ID to update
   * @param data: fields to update
   * @returns updated deck with owner information
   * @throws error 404 if deck not found
   * @throws error 400 if validation fails
   */
  static async updateDeck(id: number, data: UpdateDeckDTO) {
    // Verifica se existe
    await this.getDeckById(id);

    // Validação de cards
    if (data.cards && data.cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      const error: any = new Error(
        `Deck deve ter exatamente ${DECK_CONFIG.CARDS_PER_DECK} cartas`
      );
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.cards !== undefined) updateData.cards = data.cards;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    return prisma.deck.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Deletes a deck
   * 
   * @param id: deck ID to delete
   * @returns deleted deck data
   * @throws error 404 if deck not found
   */
  static async deleteDeck(id: number) {
    // Verifica se existe
    await this.getDeckById(id);

    return prisma.deck.delete({
      where: { id },
    });
  }

  /**
   * Increments the like count for a deck
   * 
   * @param id: deck ID to like
   * @returns updated like count
   * @throws error 404 if deck not found
   */
  static async likeDeck(id: number) {
    // Verifica se existe
    await this.getDeckById(id);

    const deck = await prisma.deck.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return deck.likes;
  }

  /**
   * Gets all decks statistics
   * 
   * @returns Statistics object with total, public, private decks and total likes
   */
  static async getStats() {
    const [total, public_count, total_likes] = await Promise.all([
      prisma.deck.count(),
      prisma.deck.count({ where: { isPublic: true } }),
      prisma.deck.aggregate({ _sum: { likes: true } }),
    ]);

    return {
      total,
      public: public_count,
      private: total - public_count,
      totalLikes: total_likes._sum.likes || 0,
    };
  }
}