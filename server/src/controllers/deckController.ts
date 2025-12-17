// server/src/controllers/deckController.ts
import { Request, Response } from 'express';
import { DeckService } from '../services/deckService';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../configs/constants';

/**
 * static funcitons to use on Route handlers
 */
export class DeckController {
  
  /**
   * List decks public and users
   */
  static listDecks = asyncHandler(async (req: Request, res: Response) => {
    const onlyPublic = req.query.onlyPublic === 'true';
    
    if (onlyPublic) {
      const decks = await DeckService.listDecks({ onlyPublic: true });
      return res.json({
        status: 'success',
        results: decks.length,
        data: decks,
      });
    }

    // need to auth to see yor dekcs
    if (!req.user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'Login required'
      });
    }

    const decks = await DeckService.listDecks({
      ownerId: req.user.id,
    });

    res.json({
      status: 'success',
      results: decks.length,
      data: decks,
    });
  });

  /**
   * Get a specific deck by its ID
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

  static createDeck = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    // Make sure user can't create decks for other users
    const deckData = { ...req.body, ownerId: userId };
    const deck = await DeckService.createDeck(deckData);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: deck,
    });
  });

  static updateDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    const deck = await DeckService.updateDeck(id, req.body, userId);

    res.json({
      status: 'success',
      data: deck,
    });
  });

  static deleteDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    await DeckService.deleteDeck(id, userId);

    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  static likeDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    
    const likes = await DeckService.likeDeck(id, userId);

    res.json({
      status: 'success',
      data: { likes },
    });
  });

  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await DeckService.getStats();

    res.json({
      status: 'success',
      data: stats,
    });
  });

  // Public endpoint to view shared decks
  static getSharedDeck = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deck = await DeckService.getSharedDeck(id);

    res.json({
      status: 'success',
      data: deck,
    });
  });
}
