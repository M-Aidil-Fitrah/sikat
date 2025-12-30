import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { autoApproveOldReports } from '@/lib/auto-approve';
import { ReportStatus, Prisma } from '@prisma/client';

// GET /api/reports - Get all approved reports (public)
export async function GET(request: NextRequest) {
  try {
    // Auto-approve old reports sebelum fetch
    await autoApproveOldReports();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeAll = searchParams.get('includeAll') === 'true';

    // Default: hanya tampilkan approved reports untuk public
    const whereClause: Prisma.ReportWhereInput = includeAll
      ? {}
      : { status: ReportStatus.APPROVED };

    // Jika ada filter status spesifik
    if (status && Object.values(ReportStatus).includes(status as ReportStatus)) {
      whereClause.status = status as ReportStatus;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        reviewedBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Transform data untuk compatibility dengan frontend
    type ReportWithReviewer = Prisma.ReportGetPayload<{
      include: { reviewedBy: { select: { id: true; name: true; username: true } } }
    }>;
    
    const transformedReports = reports.map((report: ReportWithReviewer) => ({
      ...report,
      timestamp: getRelativeTime(report.submittedAt),
    }));

    return NextResponse.json({
      success: true,
      reports: transformedReports,
      count: transformedReports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create new report (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      lat,
      lng,
      namaPelapor,
      kontak,
      desaKecamatan,
      namaObjek,
      jenisKerusakan,
      tingkatKerusakan,
      keteranganKerusakan,
      fotoLokasi = [],
    } = body;

    // Validasi required fields
    if (!lat || !lng || !namaPelapor || !kontak || !desaKecamatan || !namaObjek || 
        !jenisKerusakan || !tingkatKerusakan || !keteranganKerusakan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validasi tingkatKerusakan enum
    if (!['Ringan', 'Sedang', 'Berat'].includes(tingkatKerusakan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tingkatKerusakan value' },
        { status: 400 }
      );
    }

    // Create new report with PENDING status
    const report = await prisma.report.create({
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        namaPelapor,
        kontak,
        desaKecamatan,
        namaObjek,
        jenisKerusakan,
        tingkatKerusakan,
        keteranganKerusakan,
        fotoLokasi,
        status: ReportStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dikirim dan menunggu verifikasi admin',
      data: report,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

// Helper functions
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} menit lalu`;
  } else if (diffInHours < 24) {
    return `${diffInHours} jam lalu`;
  } else {
    return `${diffInDays} hari lalu`;
  }
}
