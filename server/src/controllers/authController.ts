// server/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { HTTP_STATUS } from '../configs/constants';

/**
 * Controller for authentication endpoints
 */
export class AuthController {
  /**
   * Register a new user
   * 
   * @route POST /api/auth/register
   * @body { name, email, password }
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const result = await AuthService.register({ name, email, password });

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Login user
   * 
   * @route POST /api/auth/login
   * @body { email, password }
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get current user info
   * 
   * @route GET /api/auth/me
   * @requires authentication
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: { user: req.user }
    });
  });
}