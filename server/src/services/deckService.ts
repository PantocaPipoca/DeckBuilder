// server/src/services/deckService.ts
import prisma from '../configs/database';
import { CreateDeckDTO, UpdateDeckDTO, DeckQueryParams } from '../types/deck.types';
import { DECK_CONFIG } from '../configs/constants';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Contacts the database and gets info I use this in controllers
 */
export class DeckService {

  /**
   * List all decks that are public or belong to the user
   * @param params DeckQueryParams
   * @returns List of decks
   */
  static async listDecks(params: DeckQueryParams = {}) {
    const { onlyPublic, ownerId, limit = 50, offset = 0 } = params;
    
    // Build where clause
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
        owner: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Get a single deck by ID
   * @param id Deck ID
   * @param userId you can pass a userid to check if its the owners deck
   * @returns 
   */
  static async getDeckById(id: number, userId?: number) {
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' },
        },
        owner: { select: { id: true, name: true } },
      },
    });

    if (!deck) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    // Check ownership if userId provided
    if (userId && deck.ownerId !== userId) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    return deck;
  }

  /**
   * Check if slot is already used
   * @param userId owner id
   * @param slot deck slot (0-4)
   * @param excludeDeckId deck ID to exclude
   */
  private static async checkSlotAvailable(userId: number, slot: number, excludeDeckId?: number) {
    const where: any = { ownerId: userId, slot };
    if (excludeDeckId) {
      where.id = { not: excludeDeckId };
    }

    const existing = await prisma.deck.findFirst({ where });

    if (existing) {
      throw { 
        statusCode: HTTP_STATUS.CONFLICT, 
        message: `Slot ${slot} already occupied` 
      };
    }
  }

  /**
   * Create deck
   * @param data CreateDeckDTO 
   * @returns new deck
   */
  static async createDeck(data: CreateDeckDTO) {
    // Check slot
    await this.checkSlotAvailable(data.ownerId, data.slot);

    // Validate card count
    if (!data.cardNames || data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: `Need exactly ${DECK_CONFIG.CARDS_PER_DECK} cards` 
      };
    }

    //Check for duplicates
    const uniqueCards = new Set(data.cardNames);
    if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'no duplicate cards allowed' 
      };
    }

    // Get cards from DB
    const cards = await prisma.card.findMany({
      where: { name: { in: data.cardNames } },
    });

    if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: `Only found ${cards.length}/${DECK_CONFIG.CARDS_PER_DECK} cards` 
      };
    }

    //map card names to IDs
    const cardMap = new Map();
    for (const card of cards) {
      cardMap.set(card.name, card.id);
    }

    //calculate avg elixir
    let totalElixir = 0;
    for (const card of cards) {
      totalElixir += card.elixir;
    }
    const avgElixir = Math.round((totalElixir / DECK_CONFIG.CARDS_PER_DECK) * 10) / 10;

    // Create the deck
    const deck = await prisma.deck.create({
      data: {
        name: data.name,
        description: data.description,
        slot: data.slot,
        isPublic: data.isPublic,
        ownerId: data.ownerId,
        avgElixir,
        cards: {
          create: data.cardNames.map((cardName, index) => ({
            cardId: cardMap.get(cardName),
            position: index,
          })),
        },
      },
      include: {
        cards: {
          select: { position: true, card: true },
          orderBy: { position: 'asc' },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return deck;
  }
  
  /**
   * Update deck
   * @param id deck id
   * @param data UpdateDeckDTO
   * @param userId owners id
   * @returns new updated deck
   */
  static async updateDeck(id: number, data: UpdateDeckDTO, userId: number) {
    // Check ownership
    const existing = await this.getDeckById(id, userId);

    //Check new slot if changing
    if (data.slot !== undefined && data.slot !== existing.slot) {
      await this.checkSlotAvailable(userId, data.slot, id);
    }

    //if updating cards
    if (data.cardNames) {
      if (data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: `Need ${DECK_CONFIG.CARDS_PER_DECK} cards` 
        };
      }

      const uniqueCards = new Set(data.cardNames);
      if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: 'No duplicates' 
        };
      }

      const cards = await prisma.card.findMany({
        where: { name: { in: data.cardNames } },
      });

      if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: `Only found ${cards.length} cards` 
        };
      }

      const cardMap = new Map();
      for (const card of cards) {
        cardMap.set(card.name, card.id);
      }

      // Delete old cards
      await prisma.deckCard.deleteMany({ where: { deckId: id } });

      // Calculate new avg
      let totalElixir = 0;
      for (const card of cards) {
        totalElixir += card.elixir;
      }
      const avgElixir = Math.round((totalElixir / DECK_CONFIG.CARDS_PER_DECK) * 10) / 10;

      return prisma.deck.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
          ...(data.slot !== undefined && { slot: data.slot }),
          avgElixir,
          cards: {
            create: data.cardNames.map((cardName, index) => ({
              cardId: cardMap.get(cardName),
              position: index,
            })),
          },
        },
        include: {
          cards: {
            select: { position: true, card: { select: { name: true, elixir: true, rarity: true } } },
            orderBy: { position: 'asc' },
          },
          owner: { select: { id: true, name: true, email: true } },
        },
      });
    }

    // Just update metadata
    return prisma.deck.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.slot !== undefined && { slot: data.slot }),
      },
      include: {
        cards: {
          select: { position: true, card: { select: { name: true, elixir: true, rarity: true } } },
          orderBy: { position: 'asc' },
        },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Just deletes the deck
   * @param id deck id
   * @param userId owner id
   * @returns  deleted deck
   */
  static async deleteDeck(id: number, userId: number) {
    await this.getDeckById(id, userId);
    return prisma.deck.delete({ where: { id } });
  }

  /**
   * like deck
   * @param id id to like
   * @param userId user liking
   * @returns new like count
   */
  static async likeDeck(id: number, userId: number) {
    await this.getSharedDeck(id);

    // Check if already liked
    const existingLike = await prisma.deckLike.findUnique({
      where: {
        deckId_userId: { deckId: id, userId: userId }
      }
    });

    if (existingLike) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Already liked' 
      };
    }

    // Create like
    await prisma.deckLike.create({
      data: { deckId: id, userId: userId }
    });

    // Increment counter
    const deck = await prisma.deck.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return deck.likes;
  }

  /**
   * Get stats of decks
   * @returns deck stats like total, public and average eligir global
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

  /**
   * Get the decks info for public viewing diferent from getDeckById
   * bcs it doesnt depend on ownership but on public status
   * @param id deck id
   * @returns deck info
   */
  static async getSharedDeck(id: number) {
    const deck = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' },
        },
        owner: { select: { id: true, name: true } },
      },
    });

    if (!deck) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    if (!deck.isPublic) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck private' };
    }

    return deck;
  }
}
