// src/routes/index.ts
import { Router } from 'express';
import deckRoutes from './deckRoutes';

const router = Router();

router.use('/decks', deckRoutes);

export default router;
