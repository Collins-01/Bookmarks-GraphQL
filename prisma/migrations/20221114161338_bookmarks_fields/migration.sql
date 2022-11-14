/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `bookmarks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_key" ON "bookmarks"("userId");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
