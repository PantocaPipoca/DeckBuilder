// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { HTTP_STATUS } from '../configs/constants';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        createdAt: Date;
      };
    }
  }
}

/**
 * Middleware to protect routes requiring authentication
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token and get user
    const user = await AuthService.verifyToken(token);

    // Attach user to request
    req.user = user;

    next();
  } catch (error: any) {
    return res.status(error.statusCode || HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: error.message || 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await AuthService.verifyToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};