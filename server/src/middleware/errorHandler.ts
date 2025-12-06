// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Error handling middleware
 * This middleware forces all express routes that are supposed to return errors
 * pass through here first.
 * This way we can have more control and debugging information if we need.
 * @param err express error object
 * @param req express request object
 * @param res express response object
 * @param next express next function (unused here)
 * @returns 
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log erro não esperado
  console.error('err:', err);

  return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    status: 'error',
    message: 'Algo correu mal no servidor',
  });
};