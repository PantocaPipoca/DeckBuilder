// server/src/routes/deckRoutes.ts
import { Router } from 'express';
import { DeckController } from '../controllers/deckController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/stats', DeckController.getStats);
router.get('/shared/:id', DeckController.getSharedDeck);

// optional authentication
router.get('/', optionalAuth, DeckController.listDecks);

// necessary authentication
router.post('/', authenticate, DeckController.createDeck);
router.get('/:id', authenticate, DeckController.getDeck);
router.put('/:id', authenticate, DeckController.updateDeck);
router.delete('/:id', authenticate, DeckController.deleteDeck);
router.post('/:id/like', authenticate, DeckController.likeDeck);

export default router;