// src/services/cardService.ts
import prisma from '../configs/database';
import { Rarity, CardType } from '@prisma/client';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Essencially this is a class that provides static methods to manage cards IN THE DATABASE.
 */
export class CardService {
  /**
   * Lists cards with optional filters
   * @param filters optional filters: rarity, type, elixir
   * @returns array of cards
   */
  static async listCards(filters?: {
    rarity?: Rarity;
    type?: CardType;
    elixir?: number;
  }) {
    const where: any = {};
    if (filters?.rarity) where.rarity = filters.rarity;
    if (filters?.type) where.type = filters.type;
    if (filters?.elixir) where.elixir = filters.elixir;

    return prisma.card.findMany({
      where,
      orderBy: [{ rarity: 'desc' }, { elixir: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Gets a card by ID
   * @param id card ID
   * @returns card
   */
  static async getCardById(id: number) {
    const card = await prisma.card.findUnique({ where: { id } });
    if (!card) throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Carta não encontrada' };
    return card;
  }

  /**
   * Gets a card by name
   * @param name card name
   * @returns card
   */
  static async getCardByName(name: string) {
    const card = await prisma.card.findUnique({ where: { name } });
    if (!card) throw { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Carta não encontrada' };
    return card;
  }

  /**
   * Gets statistics about cards
   * @returns statistics object
   */
  static async getStats() {
    const [total, byRarity, byType] = await Promise.all([
      prisma.card.count(),
      prisma.card.groupBy({
        by: ['rarity'],
        _count: true,
      }),
      prisma.card.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    return {
      total,
      byRarity,
      byType,
    };
  }
}
