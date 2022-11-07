/*
  Warnings:

  - Added the required column `issued` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "issued" TIMESTAMP(3) NOT NULL;
