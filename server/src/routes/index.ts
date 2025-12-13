// src/routes/index.ts
import { Router } from 'express';
import deckRoutes from './deckRoutes';
import cardRoutes from './cardRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Card routes
router.use('/cards', cardRoutes);

// Deck routes
router.use('/decks', deckRoutes);

// Auth routes
router.use('/auth', authRoutes);

export default router;
