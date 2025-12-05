// src/prisma-test.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const decks = await prisma.deck.findMany();
  console.log('Decks count:', decks.length);
}

main()
  .catch((e) => {
    console.error('ERROR in prisma-test:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
