// src/routes/index.ts
import { Router } from 'express';
import deckRoutes from './deckRoutes';

const router = Router();

/**
 * Deck routes
 * Mounts all deck-related endpoints under /api/decks
 */
router.use('/decks', deckRoutes);

export default router;
