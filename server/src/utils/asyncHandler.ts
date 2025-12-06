// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Avoid doing 1000 try-catches inside each async route
 * @param fn function to wrap
 * @returns wrapped function that catches errors and passes them to errorHandler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;