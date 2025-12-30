/*
  Warnings:

  - You are about to drop the column `severity` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `reports` table. All the data in the column will be lost.
  - Added the required column `kontak` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add kontak with default value first, then remove default
ALTER TABLE "reports" ADD COLUMN "kontak" TEXT NOT NULL DEFAULT '0000000000';

-- Update existing records with placeholder (you can update manually later)
-- UPDATE "reports" SET "kontak" = '0000000000' WHERE "kontak" = '0000000000';

-- Remove default so future inserts require kontak
ALTER TABLE "reports" ALTER COLUMN "kontak" DROP DEFAULT;

-- Drop legacy columns
ALTER TABLE "reports" DROP COLUMN "severity",
DROP COLUMN "type",
DROP COLUMN "verified";

-- DropEnum
DROP TYPE "Severity";
