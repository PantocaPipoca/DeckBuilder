// server/src/services/deckService.ts
import prisma from '../configs/database';
import { CreateDeckDTO, UpdateDeckDTO, DeckQueryParams } from '../types/deck.types';
import { DECK_CONFIG } from '../configs/constants';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Service for managing decks in the database
 * Now includes ownership validation
 */
export class DeckService {

  /**
   * Lists decks with ownership filter
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
   * Gets a single deck by ID with ownership validation
   */
  static async getDeckById(id: number, userId?: number) {
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

    if (!deck) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    // Validate ownership if userId provided
    if (userId && deck.ownerId !== userId) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    return deck;
  }

  /**
   * Validates that a user owns a specific deck slot
   */
  private static async validateSlotOwnership(userId: number, slot: number, excludeDeckId?: number) {
    const where: any = { ownerId: userId, slot };
    if (excludeDeckId) {
      where.id = { not: excludeDeckId };
    }

    const existingDeck = await prisma.deck.findFirst({ where });

    if (existingDeck) {
      throw { 
        statusCode: HTTP_STATUS.CONFLICT, 
        message: `Slot ${slot} already has a deck. Delete it first or choose another slot.` 
      };
    }
  }

  /**
   * Creates a new deck
   */
  static async createDeck(data: CreateDeckDTO) {
    // Validate slot ownership
    await this.validateSlotOwnership(data.ownerId, data.slot);

    // Validate card count
    if (!data.cardNames || data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: `Deck must have exactly ${DECK_CONFIG.CARDS_PER_DECK} cards` 
      };
    }

    // Validate unique cards
    const uniqueCards = new Set(data.cardNames);
    if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'You cannot repeat same cards in the deck' 
      };
    }

    // Verify all cards exist
    const cards = await prisma.card.findMany({
      where: { name: { in: data.cardNames } },
    });

    if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: `Only ${cards.length}/${DECK_CONFIG.CARDS_PER_DECK} cards exist. Check the names.` 
      };
    }

    const cardNameToId = new Map(cards.map(card => [card.name, card.id]));

    // Calculate average elixir
    let totalElixir = 0;
    for (const card of cards) {
      totalElixir += card.elixir;
    }
    const avgElixir = Math.round((totalElixir / DECK_CONFIG.CARDS_PER_DECK) * 10) / 10;

    // Create deck
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
   * Updates an existing deck with ownership validation
   */
  static async updateDeck(id: number, data: UpdateDeckDTO, userId: number) {
      // Remove all likes and reset like count
      await prisma.deckLike.deleteMany({ where: { deckId: id } });
      await prisma.deck.update({ where: { id }, data: { likes: 0 } });
    // Verify deck exists and user owns it
    const existingDeck = await this.getDeckById(id, userId);

    // If changing slot, validate new slot
    if (data.slot !== undefined && data.slot !== existingDeck.slot) {
      await this.validateSlotOwnership(userId, data.slot, id);
    }

    // If updating cards
    if (data.cardNames) {
      if (data.cardNames.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: `Deck must have exactly ${DECK_CONFIG.CARDS_PER_DECK} cards` 
        };
      }

      const uniqueCards = new Set(data.cardNames);
      if (uniqueCards.size !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: 'You cannot repeat same cards in the deck' 
        };
      }

      const cards = await prisma.card.findMany({
        where: { name: { in: data.cardNames } },
      });

      if (cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
        throw { 
          statusCode: HTTP_STATUS.BAD_REQUEST, 
          message: `Only ${cards.length}/${DECK_CONFIG.CARDS_PER_DECK} cards exist. Check the names.` 
        };
      }

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

    // If no cards to update
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
   * Deletes a deck with ownership validation
   */
  static async deleteDeck(id: number, userId: number) {
    // Verify deck exists and user owns it
    await this.getDeckById(id, userId);

    // Remove all likes and reset like count
    await prisma.deckLike.deleteMany({ where: { deckId: id } });
    await prisma.deck.update({ where: { id }, data: { likes: 0 } });

    return prisma.deck.delete({
      where: { id },
    });
  }

  /**
   * Increments like count (prevents duplicate likes from same user)
   */
  static async likeDeck(id: number, userId: number) {
    await this.getSharedDeck(id); // Verifica se deck existe e é público

    // Check if user already liked this deck
    const existingLike = await prisma.deckLike.findUnique({
      where: {
        deckId_userId: {
          deckId: id,
          userId: userId,
        }
      }
    });

    if (existingLike) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'You already liked this deck' 
      };
    }

    // Create like record
    await prisma.deckLike.create({
      data: {
        deckId: id,
        userId: userId,
      }
    });

    // Increment like count
    const deck = await prisma.deck.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return deck.likes;
  }

  /**
   * Gets deck statistics
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
   * Gets a shared deck (public decks only)
   * 
   * @param id: deck ID
   * @returns deck with full card details
   * @throws error 404 if deck not found or is private
   */
  static async getSharedDeck(id: number) {
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

    if (!deck) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck not found' };
    }

    // Only allow access to public decks
    if (!deck.isPublic) {
      throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Deck is private' };
    }

    return deck;
  }
}