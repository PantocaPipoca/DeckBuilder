import { Request, Response } from 'express';
import { DeckService } from '../services/deckService';
import { asyncHandler } from '../utils/asyncHandler';

export class DeckController {
  /**
   * GET /api/decks
   */
  static listDecks = asyncHandler(async (req: Request, res: Response) => {
    const onlyPublic = req.query.onlyPublic === 'true';
    const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const decks = await DeckService.listDecks({
      onlyPublic,
      ...(ownerId !== undefined ? { ownerId } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(offset !== undefined ? { offset } : {}),
    });

    res.json({
      status: 'success',
      results: decks.length,
      data: decks,
    });
  });

  /**
   * GET /api/decks/:id
   */
  static getDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deck = await DeckService.getDeckById(id);

    res.json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * POST /api/decks
   */
  static createDeck = asyncHandler(async (req: Request, res: Response) => {
    const deck = await DeckService.createDeck(req.body);

    res.status(201).json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * PUT /api/decks/:id
   */
  static updateDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deck = await DeckService.updateDeck(id, req.body);

    res.json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * DELETE /api/decks/:id
   */
  static deleteDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await DeckService.deleteDeck(id);

    res.status(204).send();
  });

  /**
   * POST /api/decks/:id/like
   */
  static likeDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const likes = await DeckService.likeDeck(id);

    res.json({
      status: 'success',
      data: { likes },
    });
  });

  /**
   * GET /api/decks/stats
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await DeckService.getStats();

    res.json({
      status: 'success',
      data: stats,
    });
  });
}