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
      take: limit,
      skip: offset,
      orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
      include: {
        cards: {
          select: {
            position: true,
            card: { select: { name: true, elixir: true, rarity: true } },
          },
          orderBy: { position: 'asc' },
        },
        owner: {
          select: { id: true, name: true },
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
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    if (!deck) throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
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
    // Validate card count
    if (!data.cardNames || data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { statusCode: HTTP_STATUS.BAD_REQUEST, message: `Deck must have exactly ${DECK_CONFIG.CARDS_PER_DECK} cards` };
    }

    // Validate unique cards (no duplicates)
    const uniqueCards = new Set(data.cardNames);
    if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { statusCode: HTTP_STATUS.BAD_REQUEST, message: 'You cannot repeat same cards in the deck' };
    }

    // Verify all cards exist and get their IDs
    const cards = await prisma.card.findMany({
      where: { name: { in: data.cardNames } },
    });

    if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: `Only ${cards.length}/${DECK_CONFIG.CARDS_PER_DECK} cards exist. Check the names.` 
      };
    }

    // Create a map of card names to IDs to preserve order
    const cardNameToId = new Map(cards.map(card => [card.name, card.id]));

    // Calculate average elixir
    let totalElixir = 0;
    for (const card of cards) {
      totalElixir += card.elixir;
    }
    const avgElixir = Math.round((totalElixir / DECK_CONFIG.CARDS_PER_DECK) * 10) / 10;

    // Create deck with cards
    const deck = await prisma.deck.create({
      data: {
        name: data.name,
        description: data.description,

        slot: data.slot,
        isPublic: data.isPublic,
        ownerId: data.ownerId,
        avgElixir,
        cards: {
          create: data.cardNames.map((cardName: string, index: number) => ({
            cardId: cardNameToId.get(cardName)!,
            position: index,
          })),
        },
      },
      include: {
        cards: {
          select: {
            position: true,
            card: true,
          },
          orderBy: { position: 'asc' },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return deck;
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
    // Verify deck exists
    await this.getDeckById(id);

    // If cards to update validate and recalculate elixir
    if (data.cardNames) {
      if (data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { statusCode: HTTP_STATUS.BAD_REQUEST, message: `Deck deve ter exatamente ${DECK_CONFIG.CARDS_PER_DECK} cartas` };
      }

      const uniqueCards = new Set(data.cardNames);
      if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Não podes repetir cartas no deck' };
      }

      const cards = await prisma.card.findMany({
        where: { name: { in: data.cardNames } },
      });

      if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: `Apenas ${cards.length}/${DECK_CONFIG.CARDS_PER_DECK} cartas existem. Verifica os nomes.` 
        };
      }

      // Create a map of card names to IDs to preserve order
      const cardNameToId = new Map(cards.map(card => [card.name, card.id]));

      // Delete old cards
      await prisma.deckCard.deleteMany({ where: { deckId: id } });

      // Calculate new average
      let totalElixir = 0;
      for (const card of cards) {
        totalElixir += card.elixir;
      }
      const avgElixir = Math.round((totalElixir / DECK_CONFIG.CARDS_PER_DECK) * 10) / 10;

      return prisma.deck.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
          ...(data.slot !== undefined && { slot: data.slot }),
          avgElixir,
          cards: {
            create: data.cardNames.map((cardName: string, index: number) => ({
              cardId: cardNameToId.get(cardName)!,
              position: index,
            })),
          },
        },
        include: {
          cards: {
            select: {
              position: true,
              card: { select: { name: true, elixir: true, rarity: true } },
            },
            orderBy: { position: 'asc' },
          },
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    // Ifo no cards to update
    return prisma.deck.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.slot !== undefined && { slot: data.slot }),
      },
      include: {
        cards: {
          select: {
            position: true,
            card: { select: { name: true, elixir: true, rarity: true } },
          },
          orderBy: { position: 'asc' },
        },
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
    const [totalDecks, publicDecks, totalCards, avgDeckElixir] = await Promise.all([
      prisma.deck.count(),
      prisma.deck.count({ where: { isPublic: true } }),
      prisma.card.count(),
      prisma.deck.aggregate({ _avg: { avgElixir: true } }),
    ]);

    return {
      totalDecks,
      publicDecks,
      privateDecks: totalDecks - publicDecks,
      totalCards,
      avgDeckElixir: Math.round((avgDeckElixir._avg.avgElixir || 0) * 10) / 10,
    };
  }
}