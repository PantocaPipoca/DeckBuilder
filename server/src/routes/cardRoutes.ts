// src/routes/cardRoutes.ts
import { Router } from 'express';
import * as cardController from '../controllers/cardController';

const router = Router();

router.get('/stats', cardController.getCardStats);
router.get('/', cardController.listCards);
router.get('/:id', cardController.getCardById);

export default router;
