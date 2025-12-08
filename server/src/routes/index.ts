// src/routes/index.ts
import { Router } from 'express';
import deckRoutes from './deckRoutes';
import cardRoutes from './cardRoutes';

const router = Router();

// Card routes
router.use('/cards', cardRoutes);

// Deck routes
router.use('/decks', deckRoutes);

export default router;
