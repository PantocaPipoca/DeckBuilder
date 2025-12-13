import { Request, Response } from 'express';
import { DeckService } from '../services/deckService';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Controller for deck operations
 * Now uses authenticated user from request
 */
export class DeckController {
  /**
   * Lists all decks for the authenticated user
   * 
   * @route GET /api/decks
   * @requires authentication
   */
  static listDecks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id; // User is guaranteed by authenticate middleware
    
    const decks = await DeckService.listDecks({
      ownerId: userId,
    });

    res.json({
      status: 'success',
      results: decks.length,
      data: decks,
    });
  });

  /**
   * Gets a single deck by ID
   * Only if it belongs to the authenticated user
   * 
   * @route GET /api/decks/:id
   * @param id: deck ID
   * @requires authentication
   */
  static getDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    const deck = await DeckService.getDeckById(id, userId);

    res.json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * Creates a new deck for the authenticated user
   * 
   * @route POST /api/decks
   * @body CreateDeckDTO: deck data
   * @requires authentication
   */
  static createDeck = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    // Override ownerId with authenticated user's ID
    const deckData = {
      ...req.body,
      ownerId: userId
    };
    
    const deck = await DeckService.createDeck(deckData);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * Updates an existing deck
   * Only if it belongs to the authenticated user
   * 
   * @route PUT /api/decks/:id
   * @param id: deck ID to update
   * @body UpdateDeckDTO: fields to update
   * @requires authentication
   */
  static updateDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    const deck = await DeckService.updateDeck(id, req.body, userId);

    res.json({
      status: 'success',
      data: deck,
    });
  });

  /**
   * Deletes a deck
   * Only if it belongs to the authenticated user
   * 
   * @route DELETE /api/decks/:id
   * @param id: deck ID to delete
   * @requires authentication
   */
  static deleteDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    await DeckService.deleteDeck(id, userId);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  /**
   * Increments like count for a deck
   * 
   * @route POST /api/decks/:id/like
   * @param id: deck ID to like
   * @requires authentication
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