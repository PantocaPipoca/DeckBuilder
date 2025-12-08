// src/routes/deckRoutes.ts
import { Router } from 'express';
import { DeckController } from '../controllers/deckController';

/**
 * Defines all routes related to deck operations
 */
const router = Router();

router.get('/stats', DeckController.getStats);
router.post('/:id/like', DeckController.likeDeck);
router.get('/', DeckController.listDecks);
router.post('/', DeckController.createDeck);
router.get('/:id', DeckController.getDeck);
router.put('/:id', DeckController.updateDeck);
router.delete('/:id', DeckController.deleteDeck);

export default router;