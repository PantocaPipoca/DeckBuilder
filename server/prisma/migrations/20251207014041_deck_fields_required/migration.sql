/*
  Warnings:

  - Made the column `description` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `iconUrl` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Deck` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `Deck` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avgElixir` on table `Deck` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "iconUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Deck" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "ownerId" SET NOT NULL,
ALTER COLUMN "avgElixir" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;
