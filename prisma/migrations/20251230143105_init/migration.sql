-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('MENUNGGU', 'DIVERIFIKASI', 'DITOLAK');

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "namaPelapor" TEXT NOT NULL,
    "namaObjek" TEXT NOT NULL,
    "desa" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "jenisKerusakan" TEXT NOT NULL,
    "tingkatKerusakan" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "fotoLokasi" TEXT[],
    "keterangan" TEXT,
    "status" "StatusLaporan" NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);
