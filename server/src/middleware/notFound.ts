// src/middleware/notFound.ts
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../configs/constants';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
};
