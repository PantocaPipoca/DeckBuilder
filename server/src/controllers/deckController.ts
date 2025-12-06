import { Request, Response } from 'express';
import { DeckService } from '../services/deckService';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Essencially this is a class that provides static methods to manage decks.
 * Made to use in REST API routes.
 */
export class DeckController {
  /**
   * Lists all decks with optional filtering
   * 
   * @route GET /api/decks
   * @query onlyPublic: filter for public decks only
   * @query ownerId: filter by owner ID
   * @query limit: maximum results to return
   * @query offset: number of results to skip
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
   * Gets a single deck by ID
   * 
   * @route GET /api/decks/:id
   * @param id: deck ID
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
   * Creates a new deck
   * 
   * @route POST /api/decks
   * @body CreateDeckDTO: deck data
   */
  static createDeck = asyncHandler(async (req: Request, res: Response) => {
    const deck = await DeckService.createDeck(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * Updates an existing deck
   * 
   * @route PUT /api/decks/:id
   * @param id: deck ID to update
   * @body UpdateDeckDTO: fields to update
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
   * Deletes a deck
   * 
   * @route DELETE /api/decks/:id
   * @param id: deck ID to delete
   */
  static deleteDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await DeckService.deleteDeck(id);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  /**
   * Increments like count for a deck
   * 
   * @route POST /api/decks/:id/like
   * @param id: deck ID to like
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
   * Gets deck statistics
   * 
   * @route GET /api/decks/stats
   * @returns total, public, private counts and total likes
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await DeckService.getStats();

    res.json({
      status: 'success',
      data: stats,
    });
  });
}