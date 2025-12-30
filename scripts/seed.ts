/**
 * Script untuk seed database dengan sample data
 * Run with: npx tsx scripts/seed.ts
 */

import { PrismaClient, ReportStatus, TingkatKerusakan } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Sample reports data
    const reportsData = [
      {
        lat: 5.5483,
        lng: 95.3238,
        namaPelapor: 'BPBD Banda Aceh',
        kontak: '081234567890',
        desaKecamatan: 'Banda Aceh Tengah, Banda Aceh',
        namaObjek: 'Pemukiman Padat Penduduk',
        jenisKerusakan: 'Banjir - Rumah tinggal terendam',
        tingkatKerusakan: TingkatKerusakan.Berat,
        fotoLokasi: ['/placeholder-flood1.jpg'],
        keteranganKerusakan: 'Ketinggian air 1-2 meter, akses jalan tertutup, listrik padam',
        status: ReportStatus.APPROVED,
      },
      {
        lat: 5.5788,
        lng: 95.3450,
        namaPelapor: 'Relawan PMI',
        kontak: '081234567891',
        desaKecamatan: 'Ulee Kareng, Banda Aceh',
        namaObjek: 'Kompleks Perumahan Ulee Kareng',
        jenisKerusakan: 'Banjir - Pemukiman dan fasilitas umum',
        tingkatKerusakan: TingkatKerusakan.Berat,
        fotoLokasi: ['/placeholder-flood1.jpg'],
        keteranganKerusakan: 'Masjid terendam, puskesmas tidak beroperasi',
        status: ReportStatus.APPROVED,
      },
      {
        lat: 5.4891,
        lng: 95.4012,
        namaPelapor: 'BPBD Aceh Besar',
        kontak: '081234567892',
        desaKecamatan: 'Krueng Raya, Aceh Besar',
        namaObjek: 'Jalan Provinsi Km 12',
        jenisKerusakan: 'Longsor - Jalan tertutup material',
        tingkatKerusakan: TingkatKerusakan.Berat,
        fotoLokasi: ['/placeholder-landslide1.jpg'],
        keteranganKerusakan: 'Jalan provinsi tertutup material longsor, 8 rumah rusak berat',
        status: ReportStatus.PENDING,
      },
    ];

    // Create reports
    for (const data of reportsData) {
      await prisma.report.create({ data });
    }

    console.log(`✅ Created ${reportsData.length} sample reports`);
    console.log('✨ Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
