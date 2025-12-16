import prisma from '../configs/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../configs/constants';
import { RegisterDTO, LoginDTO } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'qPreguicaMeu';
const JWT_EXPIRES_IN = '7d';

/**
 * Service for handling user authentication
 */
export class AuthService {
  /**
   * Registers a new user
   */
  static async register(data: RegisterDTO) {
    const { name, email, password } = data;

    // Validate input
    if (!name || !email || !password) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Name, email and password are required' 
      };
    }

    if (password.length < 6) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Password must be at least 6 characters' 
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw { 
        statusCode: HTTP_STATUS.CONFLICT, 
        message: 'Email already registered' 
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    // Generate token
    const token = this.generateToken(user.id);

    return { user, token };
  }

  /**
   * Logs in a user
   */
  static async login(data: LoginDTO) {
    const { email, password } = data;

    // Validate input
    if (!email || !password) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Email and password are required' 
      };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Invalid email or password' 
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw { 
        statusCode: HTTP_STATUS.BAD_REQUEST, 
        message: 'Invalid email or password' 
      };
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Verifies a JWT token and returns the user
   */
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
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
        message: 'Invalid or expired token' 
      };
    }
  }

  /**
   * Generates a JWT token for a user
   */
  private static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}