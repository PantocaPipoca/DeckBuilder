-- AlterTable
ALTER TABLE "Deck" ADD COLUMN "slot" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_ownerId_slot_key" ON "Deck"("ownerId", "slot");
