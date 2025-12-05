import prisma from './prisma';

export const listDecks = async (onlyPublic?: boolean) => {
  const where = onlyPublic ? { isPublic: true } : {};
  return prisma.deck.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getDeckById = async (id: number) => {
  return prisma.deck.findUnique({ where: { id } });
};

export const createDeck = async (data: {
  name: string;
  description?: string;
  cards: string[];
  isPublic?: boolean;
  ownerId?: number | null;
}) => {
  // Prisma expects `cards` as Json; pass directly (array)
  return prisma.deck.create({
    data: {
      name: data.name,
      description: data.description ?? '',
      cards: data.cards as unknown, // prisma Json accepts unknown
      isPublic: data.isPublic ?? false,
      likes: 0,
      ownerId: data.ownerId ?? null,
    },
  });
};

export const updateDeck = async (id: number, data: {
  name?: string;
  description?: string;
  cards?: string[];
  isPublic?: boolean;
}) => {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.cards !== undefined) updateData.cards = data.cards as unknown;
  if (typeof data.isPublic === 'boolean') updateData.isPublic = data.isPublic;

  return prisma.deck.update({
    where: { id },
    data: updateData,
  });
};

export const deleteDeck = async (id: number) => {
  return prisma.deck.delete({ where: { id } });
};

export const likeDeck = async (id: number) => {
  // increment atomicamente
  const deck = await prisma.deck.update({
    where: { id },
    data: { likes: { increment: 1 } as any },
  });
  return deck.likes;
};
