// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * // Wraps for async functions to avoid doing a million try catch blocks
 * @param fn funciton to wrap
 * @returns basically the same function but with error catching
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
