// src/config/database.ts
import { PrismaClient } from '@prisma/client';

/**
 * Creates Prisma instance with specifiable logging
 * In development logs queries, errors, and warnings
 * In production only logs errors
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}


/**
 * Prisma` Singleton
 * In development, stores globally to survive hot-reloads.
 */
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;