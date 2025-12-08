// src/controllers/cardController.ts
import { Request, Response } from 'express';
import { CardService } from '../services/cardService';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../configs/constants';

/**
 * CardController provides static methods to manage cards.
 * Used in REST API routes.
 */
export const listCards = asyncHandler(async (req: Request, res: Response) => {
  const { rarity, type, elixir } = req.query;
  
  const filters: any = {};
  if (rarity) filters.rarity = rarity;
  if (type) filters.type = type;
  if (elixir) filters.elixir = parseInt(elixir as string);

  const cards = await CardService.listCards(filters);
  
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: { cards },
    count: cards.length,
  });
});

/**
 * Get a single card by ID
 */
export const getCardById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const card = await CardService.getCardById(parseInt(id!));
  
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: { card },
  });
});

/**
 * Get a single card by name
 */
export const getCardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await CardService.getStats();
  
  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: stats,
  });
});
