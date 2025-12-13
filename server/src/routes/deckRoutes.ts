// src/routes/deckRoutes.ts
import { Router } from 'express';
import { DeckController } from '../controllers/deckController';
import { authenticate } from '../middleware/auth';

/**
 * Defines all routes related to deck operations
 */
const router = Router();

// Public routes
router.get('/stats', DeckController.getStats);

// Require authentication
router.get('/', authenticate, DeckController.listDecks);
router.post('/', authenticate, DeckController.createDeck);
router.get('/:id', authenticate, DeckController.getDeck);
router.put('/:id', authenticate, DeckController.updateDeck);
router.delete('/:id', authenticate, DeckController.deleteDeck);
router.post('/:id/like', authenticate, DeckController.likeDeck);

export default router;