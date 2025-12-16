// server/src/services/cardService.ts
import prisma from '../configs/database';
import { Rarity, CardType } from '@prisma/client';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Service for card database operations
 */
export class CardService {
  
  /**
   * Get all cards with optional filters
   */
  static async listCards(filters?: any) {
    const where: any = {};
    
    if (filters?.rarity) {
      where.rarity = filters.rarity;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.elixir) {
      where.elixir = filters.elixir;
    }

    return prisma.card.findMany({
      where,
      orderBy: [
        { rarity: 'desc' }, 
        { elixir: 'asc' }, 
        { name: 'asc' }
      ],
    });
  }

  /**
   * Get a single card by ID
   */
  static async getCardById(id: number) {
    const card = await prisma.card.findUnique({ 
      where: { id } 
    });
    
    if (!card) {
      throw { 
        statusCode: HTTP_STATUS.NOT_FOUND, 
        message: 'Card not found' 
      };
    }
    
    return card;
  }

  /**
   * Get a card by name
   */
  static async getCardByName(name: string) {
    const card = await prisma.card.findUnique({ 
      where: { name } 
    });
    
    if (!card) {
      throw { 
        statusCode: HTTP_STATUS.NOT_FOUND, 
        message: 'Card not found' 
      };
    }
    
    return card;
  }

  /**
   * Get card statistics
   */
  static async getStats() {
    // Total cards
    const total = await prisma.card.count();
    
    // Count by rarity
    const byRarity = await prisma.card.groupBy({
      by: ['rarity'],
      _count: true,
    });
    
    // Count by type
    const byType = await prisma.card.groupBy({
      by: ['type'],
      _count: true,
    });

    return {
      total,
      byRarity,
      byType,
    };
  }
}
