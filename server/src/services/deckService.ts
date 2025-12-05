// src/services/deckService.ts
import prisma from '../configs/database';
import { CreateDeckDTO, UpdateDeckDTO, DeckQueryParams } from '../types/deck.types';
import { DECK_CONFIG } from '../configs/constants';

export class DeckService {
  /**
   * Lista decks com filtros opcionais
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
   * Obtém deck por ID
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
      error.statusCode = 404;
      throw error;
    }

    return deck;
  }

  /**
   * Cria novo deck
   */
  static async createDeck(data: CreateDeckDTO) {
    // Validação
    if (!data.cards || data.cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      const error: any = new Error(
        `Deck deve ter exatamente ${DECK_CONFIG.CARDS_PER_DECK} cartas`
      );
      error.statusCode = 400;
      throw error;
    }

    if (data.name.length > DECK_CONFIG.MAX_NAME_LENGTH) {
      const error: any = new Error('Nome do deck muito longo');
      error.statusCode = 400;
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
   * Atualiza deck existente
   */
  static async updateDeck(id: number, data: UpdateDeckDTO) {
    // Verifica se existe
    await this.getDeckById(id);

    // Validação de cards
    if (data.cards && data.cards.length !== DECK_CONFIG.CARDS_PER_DECK) {
      const error: any = new Error(
        `Deck deve ter exatamente ${DECK_CONFIG.CARDS_PER_DECK} cartas`
      );
      error.statusCode = 400;
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
   * Remove deck
   */
  static async deleteDeck(id: number) {
    // Verifica se existe
    await this.getDeckById(id);

    return prisma.deck.delete({
      where: { id },
    });
  }

  /**
   * Adiciona like ao deck
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
   * Obtém estatísticas de decks
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