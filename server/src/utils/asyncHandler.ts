// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

// Wraps async functions to avoid doing a million try-catch blocks
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
