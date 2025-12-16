-- CreateTable
CREATE TABLE "DeckLike" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeckLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeckLike_deckId_idx" ON "DeckLike"("deckId");

-- CreateIndex
CREATE INDEX "DeckLike_userId_idx" ON "DeckLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeckLike_deckId_userId_key" ON "DeckLike"("deckId", "userId");

-- AddForeignKey
ALTER TABLE "DeckLike" ADD CONSTRAINT "DeckLike_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckLike" ADD CONSTRAINT "DeckLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
