// src/middleware/notFound.ts
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../configs/constants';

/**
 * 404 Not Found middleware
 * This middlware forces all express routes that are supposed to return 404
 * pass through here first.
 * This way we can have more control and debugging information if we need.
 * @param req express request object
 * @param res express response object
 * @param next express next function (unused here)
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: `Rota ${req.originalUrl} não encontrada`,
  });
};