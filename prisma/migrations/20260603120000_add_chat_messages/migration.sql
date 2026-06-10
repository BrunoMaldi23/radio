-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "room" TEXT NOT NULL DEFAULT 'tv',
    "author" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ipHash" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_room_createdAt_idx" ON "ChatMessage"("room", "createdAt");
