// src/routes/deckRoutes.ts
import { Router } from 'express';
import { DeckController } from '../controllers/deckController';

const router = Router();

router.get('/stats', DeckController.getStats);
router.get('/', DeckController.listDecks);
router.get('/:id', DeckController.getDeck);
router.post('/', DeckController.createDeck);
router.put('/:id', DeckController.updateDeck);
router.delete('/:id', DeckController.deleteDeck);
router.post('/:id/like', DeckController.likeDeck);

export default router;