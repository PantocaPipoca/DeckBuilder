// src/routes/index.ts
import { Router } from 'express';
import deckRoutes from './deckRoutes';
import cardRoutes from './cardRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/cards', cardRoutes);
router.use('/decks', deckRoutes);
router.use('/auth', authRoutes);

export default router;
