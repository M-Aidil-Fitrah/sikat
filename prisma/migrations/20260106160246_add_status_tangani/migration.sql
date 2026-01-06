-- CreateEnum
CREATE TYPE "StatusTangani" AS ENUM ('SUDAH_DITANGANI', 'BELUM_DITANGANI');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "statusTangani" "StatusTangani" NOT NULL DEFAULT 'BELUM_DITANGANI';
