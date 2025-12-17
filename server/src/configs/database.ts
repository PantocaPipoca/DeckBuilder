// src/config/database.ts
import { PrismaClient } from '@prisma/client';

/**
 * creates a prisma cliente singleton
 * @returns prisma cliente duh
 */
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

declare global {
  var prisma: undefined | ReturnType<typeof createPrismaClient>;
}

const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
