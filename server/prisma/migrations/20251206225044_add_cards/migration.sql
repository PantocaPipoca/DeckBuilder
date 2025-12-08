/*
  Warnings:

  - You are about to drop the column `cards` on the `Deck` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Deck` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('TROOP', 'SPELL', 'BUILDING');

-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT "Deck_ownerId_fkey";

-- DropIndex
DROP INDEX "Deck_slug_key";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "cards",
DROP COLUMN "slug",
ADD COLUMN     "avgElixir" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "elixir" INTEGER NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "type" "CardType" NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_key" ON "Card"("name");

-- CreateIndex
CREATE INDEX "Card_rarity_idx" ON "Card"("rarity");

-- CreateIndex
CREATE INDEX "Card_type_idx" ON "Card"("type");

-- CreateIndex
CREATE INDEX "Card_elixir_idx" ON "Card"("elixir");

-- CreateIndex
CREATE INDEX "DeckCard_deckId_idx" ON "DeckCard"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_cardId_key" ON "DeckCard"("deckId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckCard_deckId_position_key" ON "DeckCard"("deckId", "position");

-- CreateIndex
CREATE INDEX "Deck_isPublic_idx" ON "Deck"("isPublic");

-- CreateIndex
CREATE INDEX "Deck_likes_idx" ON "Deck"("likes");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
