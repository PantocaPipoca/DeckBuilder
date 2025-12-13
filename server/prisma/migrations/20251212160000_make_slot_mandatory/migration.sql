-- DropForeignKey
ALTER TABLE "Deck" DROP CONSTRAINT IF EXISTS "Deck_ownerId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Deck_ownerId_slot_key";

-- Delete all existing decks to start fresh
DELETE FROM "DeckCard";
DELETE FROM "Deck";

-- AlterTable - Make slot NOT NULL and add it if missing
ALTER TABLE "Deck" ALTER COLUMN "slot" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_ownerId_slot_key" ON "Deck"("ownerId", "slot");
