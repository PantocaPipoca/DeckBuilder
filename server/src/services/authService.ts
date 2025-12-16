// server/src/services/authService.ts
import prisma from '../configs/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../configs/constants';
import { RegisterDTO, LoginDTO } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'qPreguicaMeu';
const JWT_EXPIRES_IN = '7d';

/**
 * Handles user authentication - register, login, verify token
 */
export class AuthService {
  
  /**
   * Register a new user
   */
  static async register(data: RegisterDTO) {
    const { name, email, password } = data;

    // Check all fields exist
    if (!name || !email || !password) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Need name, email and password' 
      };
    }

    // Check password length
    if (password.length < 6) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Password too short (min 6 chars)' 
      };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw { 
        statusCode: HTTP_STATUS.CONFLICT, 
        message: 'Email already in use' 
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    // Create JWT token
    const token = this.createToken(user.id);

    return { user, token };
  }

  /**
   * Login existing user
   */
  static async login(data: LoginDTO) {
    const { email, password } = data;

    // Check fields
    if (!email || !password) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Need email and password' 
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Wrong email or password' 
      };
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Wrong email or password' 
      };
    }

    // Create token
    const token = this.createToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Verify JWT token and get user
   */
  static async verifyToken(token: string) {
    try {
      // Decode token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      });

      if (!user) {
        throw { 
          statusCode: HTTP_STATUS.NOT_FOUND, 
          message: 'User not found' 
        };
      }

      return user;
      
    } catch (error) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Invalid token' 
      };
    }
  }

  // Create a JWT token for user
  private static createToken(userId: number): string {
    return jwt.sign(
      { userId }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}
