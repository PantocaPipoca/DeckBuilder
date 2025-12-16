// src/config/database.ts
import { PrismaClient } from '@prisma/client';

// Create Prisma client with logging based on environment
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

declare global {
  var prisma: undefined | ReturnType<typeof createPrismaClient>;
}

// Use global variable in development to prevent hot-reload issues
const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
